terraform {
  required_version = ">= 1.1"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.region
}

resource "aws_ecs_cluster" "this" {
  name = var.cluster_name
}

resource "aws_launch_template" "ecs" {
  name_prefix   = "${var.cluster_name}-lt-"
  image_id      = var.ami_id
  instance_type = var.instance_type
  key_name      = var.key_name

  user_data = base64encode(file("${path.module}/user_data.sh"))

  iam_instance_profile {
    name = var.instance_profile_name
  }

  vpc_security_group_ids = var.instance_sg_ids
}

resource "aws_autoscaling_group" "ecs" {
  name = "${var.cluster_name}-asg"

  launch_template {
    id      = aws_launch_template.ecs.id
    version = "$Latest"
  }

  min_size         = var.min_size
  max_size         = var.max_size
  desired_capacity = var.desired_capacity

  vpc_zone_identifier = var.subnet_ids

  tag {
    key                 = "Name"
    value               = var.cluster_name
    propagate_at_launch = true
  }
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/${var.cluster_name}"
  retention_in_days = 14
}

data "aws_ecr_repository" "backend_repo" {
  name = var.repo_backend
}

data "aws_ecr_image" "backend_latest" {
  repository_name = var.repo_backend
  most_recent     = true
}

data "aws_ecr_repository" "frontend_repo" {
  name = var.repo_frontend
}

data "aws_ecr_image" "frontend_latest" {
  repository_name = var.repo_frontend
  most_recent     = true
}

resource "aws_ecs_task_definition" "app_task" {
  family                   = "${var.cluster_name}-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["EC2"]
  cpu                      = "1024"
  memory                   = "2048"

  execution_role_arn = var.execution_role_arn
  task_role_arn      = var.task_role_arn

  volume {
    name      = "db-data"
    host_path = "/ecs/${var.cluster_name}/db-data"
  }

  container_definitions = jsonencode([
    {
      name      = "db"
      image     = "postgres:15"
      cpu       = 256
      memory    = 512
      essential = true

      portMappings = [
        {
          containerPort = 5432
          hostPort      = 5432
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "POSTGRES_DB",       value = "eatery" },
        { name = "POSTGRES_USER",     value = "postgres" },
        { name = "POSTGRES_PASSWORD", value = "postgres" }
      ]

      healthCheck = {
        command     = ["CMD-SHELL", "pg_isready -U postgres"]
        interval    = 10
        timeout     = 5
        retries     = 5
        startPeriod = 0
      }

      mountPoints = [
        {
          sourceVolume  = "db-data"
          containerPath = "/var/lib/postgresql/data"
          readOnly      = false
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/ecs/${var.cluster_name}"
          awslogs-region        = var.region
          awslogs-stream-prefix = "db"
        }
      }
    },
    {
      name      = "django-backend"
      image     = "${data.aws_ecr_repository.backend_repo.repository_url}@${data.aws_ecr_image.backend_latest.image_digest}"
      cpu       = 512
      memory    = 1024
      essential = true

      dependsOn = [
        { containerName = "db", condition = "START" },
        { containerName = "db", condition = "HEALTHY" }
      ]

      portMappings = [
        {
          containerPort = 8000
          hostPort      = 8000
          protocol      = "tcp"
        }
      ]

      environment = [
        { name = "POSTGRES_HOST",     value = "127.0.0.1" },
        { name = "POSTGRES_PORT",     value = "5432" },
        { name = "POSTGRES_DB",       value = "eatery" },
        { name = "POSTGRES_USER",     value = "postgres" },
        { name = "POSTGRES_PASSWORD", value = "postgres" },
        {
          name  = "API_KEY"
          value = var.google_api_key
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/ecs/${var.cluster_name}"
          awslogs-region        = var.region
          awslogs-stream-prefix = "django-backend"
        }
      }
    },
    {
      name      = "react-frontend"
      image     = "${data.aws_ecr_repository.frontend_repo.repository_url}@${data.aws_ecr_image.frontend_latest.image_digest}"
      cpu       = 256
      memory    = 512
      essential = false

      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]

      environment = [
        {
          name  = "NEXT_PUBLIC_API_URL"
          value = "http://${var.api_url}/api"
        },
        {
          name  = "API_KEY"
          value = var.google_api_key
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/ecs/${var.cluster_name}"
          awslogs-region        = var.region
          awslogs-stream-prefix = "react-frontend"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "backend_service" {
  name            = "${var.cluster_name}-backend-svc"
  cluster         = aws_ecs_cluster.this.id
  launch_type     = "EC2"
  desired_count   = 2
  task_definition = aws_ecs_task_definition.app_task.arn

  enable_execute_command = true

  network_configuration {
    subnets         = var.subnet_ids
    security_groups = var.instance_sg_ids
  }

  load_balancer {
    container_name   = "django-backend"
    container_port   = 8000
    target_group_arn = var.backend_target_group_arn
  }

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200
}

resource "aws_ecs_service" "frontend_service" {
  name            = "${var.cluster_name}-frontend-svc"
  cluster         = aws_ecs_cluster.this.id
  launch_type     = "EC2"
  desired_count   = 2
  task_definition = aws_ecs_task_definition.app_task.arn

  enable_execute_command = true

  network_configuration {
    subnets         = var.subnet_ids
    security_groups = var.instance_sg_ids
  }

  load_balancer {
    container_name   = "react-frontend"
    container_port   = 3000
    target_group_arn = var.frontend_target_group_arn
  }

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200
}

