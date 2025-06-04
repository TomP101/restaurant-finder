terraform {
  backend "s3" {
    bucket = "tprusalowicz-terraform-state-eu-north-1"
    key    = "terraform/terraform.tfstate"
    region = "eu-north-1"
  }
}


