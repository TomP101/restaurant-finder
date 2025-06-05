# Create a VPC for our resources
resource "aws_vpc" "network" {
  cidr_block = "10.0.0.0/24"
  tags = {
    Name = var.tag_name
  }
}

# Two public subnets for high availability
resource "aws_subnet" "subnet_eu_north1a" {
  vpc_id                  = aws_vpc.network.id
  availability_zone       = "eu-north-1a"
  map_public_ip_on_launch = true
  cidr_block              = "10.0.0.0/25"
  tags = {
    Name = var.tag_name
  }
}

resource "aws_subnet" "subnet_eu_north1b" {
  vpc_id                  = aws_vpc.network.id
  availability_zone       = "eu-north-1b"
  map_public_ip_on_launch = true
  cidr_block              = "10.0.0.128/25"
  tags = {
    Name = var.tag_name
  }
}

resource "aws_security_group" "sg1" {
  vpc_id = aws_vpc.network.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}


# Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.network.id
  tags = {
    Name = var.tag_name
  }
}

# Route Table for public subnets
resource "aws_route_table" "routetable" {
  vpc_id = aws_vpc.network.id
  tags = {
    Name = var.tag_name
  }
}

# Associate route table with both subnets
resource "aws_route_table_association" "sub_eu_north1a_asso" {
  route_table_id = aws_route_table.routetable.id
  subnet_id      = aws_subnet.subnet_eu_north1a.id
}

resource "aws_route_table_association" "sub_eu_north1b_asso" {
  route_table_id = aws_route_table.routetable.id
  subnet_id      = aws_subnet.subnet_eu_north1b.id
}

# Default route to Internet Gateway
resource "aws_route" "internet_route" {
  route_table_id         = aws_route_table.routetable.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.igw.id
}

# Application Load Balancer
resource "aws_lb" "application-lb" {
  name               = "aws-alb"
  internal           = false
  ip_address_type    = "ipv4"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.sg1.id]
  subnets            = [
    aws_subnet.subnet_eu_north1a.id,
    aws_subnet.subnet_eu_north1b.id
  ]
  tags = {
    Name = var.tag_name
  }
}


resource "aws_lb_target_group" "frontend_tg" {
  name        = "frontend-tg"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.network.id

  health_check {
    path                = "/"
    protocol            = "HTTP"
    matcher             = "200-399"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  tags = {
    Name = "frontend-tg"
  }

  lifecycle {
    create_before_destroy = true
  }
}


resource "aws_lb_target_group" "backend_tg" {
  name        = "backend-tg"
  port        = 8000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.network.id

  health_check {
    path                = "/health"
    protocol            = "HTTP"
    matcher             = "200-399"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  tags = {
    Name = "backend-tg"
  }

  lifecycle {
    create_before_destroy = true
  }
}

#
# Listener ALB: domyślnie forward do frontend_tg
#
resource "aws_lb_listener" "listener_forward_all" {
  load_balancer_arn = aws_lb.application-lb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    target_group_arn = aws_lb_target_group.frontend_tg.arn
    type             = "forward"
  }
}


resource "aws_lb_listener_rule" "api_rule" {
  listener_arn = aws_lb_listener.listener_forward_all.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_tg.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }
}



