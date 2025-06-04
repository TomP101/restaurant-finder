variable "cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "eu-north-1"
}

variable "ami_id" {
  description = "AMI ID for ECS-optimized host instances"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type for the ECS hosts"
  type        = string
  default     = "t3.medium"
}

variable "instance_profile_name" {
  description = "Name of the IAM instance profile to attach to ECS hosts"
  type        = string
}

variable "repo_backend" {
  description = "Name of the ECR repository for Django backend"
  type        = string
  default     = "backend-repo"
}

variable "repo_frontend" {
  description = "Name of the ECR repository for React frontend"
  type        = string
  default     = "frontend-repo"
}

variable "backend_target_group_arn" {
  type        = string
  description = "ARN target group dla Django-backend"
}
variable "frontend_target_group_arn" {
  type        = string
  description = "ARN target group dla React-frontend"
}

variable "subnet_ids" {
  description = "List of subnet IDs for the ECS AutoScalingGroup"
  type        = list(string)
}

variable "instance_sg_ids" {
  description = "List of Security Group IDs for the ECS hosts"
  type        = list(string)
}

variable "min_size" {
  description = "Minimum number of ECS host instances"
  type        = number
  default     = 1
}

variable "max_size" {
  description = "Maximum number of ECS host instances"
  type        = number
  default     = 3
}

variable "desired_capacity" {
  description = "Desired number of ECS host instances"
  type        = number
  default     = 2
}

variable "execution_role_arn" {
  type        = string
  description = "ARN of the ECS task execution role"
}

variable "task_role_arn" {
  type        = string
  description = "ARN of the IAM role that the task’s containers should assume"
}

variable "key_name" {
  description = "Name of the EC2 Key Pair for SSH access"
  type        = string
}


variable "image_tag" {
  description = "Tag obrazu Dockerowego w ECR (np. skrót commita)"
  type        = string
}
