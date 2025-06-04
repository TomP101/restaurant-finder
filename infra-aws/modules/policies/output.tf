output "instance_profile_name" {
  description = "Name of the created IAM instance profile"
  value       = aws_iam_instance_profile.ecs.name
}

output "instance_role_arn" {
  description = "ARN of the IAM role for ECS hosts"
  value       = aws_iam_role.instance.arn
}

output "task_execution_role_arn" {
  description = "ARN of the IAM role for ECS task execution"
  value       = aws_iam_role.task_execution.arn
}

output "task_role_arn" {
  value = aws_iam_role.task_role.arn
}
