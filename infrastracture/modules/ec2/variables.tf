variable "instance_type" {
  default = "t2.micro"
}
variable "vpc_security_group_ids" {
  default = []
}
variable "associate_public_ip_address" {
  default = false
}
variable "subnet_id" {}
variable "name" {}
variable "private_ip" {

}