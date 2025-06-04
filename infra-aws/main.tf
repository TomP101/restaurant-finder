module "network" {
  source = "./modules/network"
}

module "policies" {
  source                    = "./modules/policies"
  instance_role_name        = "ecs-host-role"
  instance_profile_name     = "ecs-host-profile"
  task_execution_role_name  = "ecs-task-exec-role"
}

module "compute" {
  source                = "./modules/compute"
  cluster_name          = "petclinic-cluster"
  ami_id                = "ami-03d06800319b9bb52" 
  instance_type         = var.instance_type
  instance_profile_name = module.policies.instance_profile_name
  subnet_ids            = module.network.subnet_ids
  instance_sg_ids       = module.network.sg_ids
  execution_role_arn    = module.policies.task_execution_role_arn
  task_role_arn         = module.policies.task_role_arn
  min_size              = var.min_size
  max_size              = var.max_size
  desired_capacity      = var.desired_capacity
  tag_name              = var.tag_name
  backend_target_group_arn = module.network.backend_tg_arn
  frontend_target_group_arn = module.network.frontend_tg_arn

  key_name              = "prywatny_tomek_aws"

  repo_backend    = "backend-repo"
  repo_frontend   = "frontend-repo"
  image_tag       = var.image_tag



}
