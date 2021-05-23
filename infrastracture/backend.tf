terraform {
  backend "s3" {
    bucket = "eullo-tf-state"
    key = "terraform.tfstate"
    region = "eu-west-1"
    profile = "sandbox"
  }
}