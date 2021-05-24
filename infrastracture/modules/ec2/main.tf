locals {

}
data "aws_ami" "ubuntu" {
  most_recent = true

  filter {
    name = "name"
    values = [
      "ubuntu/images/hvm-ssd/ubuntu-focal-20.04-amd64-server-*"]
  }

  filter {
    name = "virtualization-type"
    values = [
      "hvm"]
  }

  owners = [
    "099720109477"]
}

resource "aws_instance" "server" {
  ami = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  associate_public_ip_address = var.associate_public_ip_address
  hibernation = true
  key_name = var.key
  subnet_id = var.subnet_id
  vpc_security_group_ids = var.vpc_security_group_ids
  private_ip = var.private_ip
  root_block_device {
    delete_on_termination = false
    encrypted = true
    volume_size = 20
  }
  tags = {
    Name = var.name
  }
}

