variable "region" {
  description = "AWS region"
  type        = string
  default     = "eu-north-1"
}

variable "instance_type" {
  description = "EC2 instance type for ECS hosts"
  type        = string
  default     = "t3.large"
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

variable "tag_name" {
  description = "Name tag for all resources"
  type        = string
  default     = "petclinic"
}

variable "image_tag" {
  description = "Tag obrazu Dockerowego, który Jenkins wypchnął do ECR"
  type        = string
  default     = "a12312"
}


variable "google_api_key" {
  description = "Klucz API Google"
  type        = string
  sensitive   = true
}
