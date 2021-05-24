locals {
  name = "pfa"
  region = var.region
  tags = {
    Owner = "khaled"
    Project = "Eullo"
    Environment = var.env
  }
}
module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  # The rest of arguments are omitted for brevity
  enable_nat_gateway = true
  single_nat_gateway = true
  one_nat_gateway_per_az = false
  #  Skip creation of EIPs for the NAT Gateways
  reuse_nat_ips = true
  #  IPs specified here as input to the module
  external_nat_ip_ids = "${aws_eip.nat.*.id}"
  name = local.name
  cidr = "10.0.0.0/26"
  # 10.0.0.0/8 is reserved for EC2-Classic
  azs = [
    "${local.region}b"]
  private_subnets = [
    "10.0.0.0/27"
  ]
  public_subnets = [
    "10.0.0.32/28"]
  enable_dhcp_options = true
  # VPC Flow Logs (Cloudwatch log group and IAM role will be created)
  enable_flow_log = true
  create_flow_log_cloudwatch_log_group = true
  create_flow_log_cloudwatch_iam_role = true
  flow_log_max_aggregation_interval = 60
  enable_dns_hostnames = true

  tags = local.tags
}
resource "aws_eip" "nat" {
  vpc = true
}

resource "aws_key_pair" "ssh-key" {
  key_name = "eullo"
  public_key = file("./keys/eullo.pub")
}
resource "aws_eip" "eip_assoc" {
  instance =  module.ec2_ldap.id
  vpc      = true
}
//resource "aws_eip_association" "eip_assoc" {
//  instance_id   = module.ec2_ldap.id
//  allocation_id = aws_eip.nat.id
//}

//module "ec2_backend" {
//  depends_on = [
//    module.node_master_sg]
//  instance_type = "t2.micro"
//  key =  aws_key_pair.ssh-key.id

//  name="ChatServer"
//
//  source = "./modules/ec2"
//  private_ip = "10.0.0.40"
//  subnet_id = module.vpc.public_subnets[0]
//  vpc_security_group_ids = [
//    module.node_master_sg.this_security_group_id]
//}
module "ec2_ldap" {
  depends_on = [
    module.ldap_sg]
  name = "ldap"
  key = aws_key_pair.ssh-key.id
  source = "./modules/ec2"
  private_ip = "10.0.0.39"
  subnet_id = module.vpc.public_subnets[0]
  associate_public_ip_address = true
  vpc_security_group_ids = [
    module.ldap_sg.this_security_group_id]
}

resource "local_file" "instances-ids" {
  content = jsonencode(
  [
    module.ec2_ldap.instance-arn,
    //    module.ec2_backend.instance-arn
  ])
  filename = "instance-ids.txt"
}
module "serverSG" {
  source = "terraform-aws-modules/security-group/aws"
  version = "~> 3.0"

  name = "server-sg"
  description = "Security group for the KBS8 master "
  vpc_id = module.vpc.vpc_id
  ingress_cidr_blocks = [
    "10.0.0.0/26"]
  ingress_rules = [
    "ssh-tcp",
    "all-icmp",
  ]
  ingress_with_cidr_blocks = [
    {
      from_port = 6443
      to_port = 6443
      protocol = "tcp"
      description = "Kubernetes API Server"
      cidr_blocks = "10.10.0.0/16"
    },
    {
      from_port = 2379
      to_port = 2380
      protocol = "tcp"
      description = "etcd server client API"
      cidr_blocks = "10.10.0.0/16"
    },
    {
      from_port = 10250
      to_port = 10253
      protocol = "tcp"
      description = "Kublet API kube-scheduler kube-controller-manager Kublet API"
      cidr_blocks = "10.10.0.0/16"
    }
  ]
  egress_with_cidr_blocks = [
    {
      rule = "all-all"
      cidr_blocks = "0.0.0.0/0"
    }
  ]
}
module "node_worker_sg" {
  source = "terraform-aws-modules/security-group/aws"
  version = "~> 3.0"

  name = "kbs8-sg-worker"
  description = "Security group for the KBS8 master "
  vpc_id = module.vpc.vpc_id
  ingress_cidr_blocks = [
    "10.0.0.0/26"]
  ingress_rules = [
    "ssh-tcp",
    "all-icmp",
  ]
  ingress_with_cidr_blocks = [
    {
      from_port = 10250
      to_port = 10250
      protocol = "tcp"
      description = "Kublet API"
      cidr_blocks = "10.10.0.0/16"
    },
    {
      from_port = 10255
      to_port = 10255
      protocol = "tcp"
      description = "Read-Only Kublet API"
      cidr_blocks = "10.10.0.0/16"
    },
    {
      from_port = 30000
      to_port = 32767
      protocol = "tcp"
      description = "NodePort Services"
      cidr_blocks = "10.10.0.0/16"
    }
  ]
  egress_with_cidr_blocks = [
    {
      rule = "all-all"
      cidr_blocks = "0.0.0.0/0"
    }
  ]
}
module "ldap_sg" {
  source = "terraform-aws-modules/security-group/aws"
  version = "~> 3.0"
  name = "ldap-sg"
  description = "Security group for the Load Balancer "
  vpc_id = module.vpc.vpc_id
  ingress_cidr_blocks = [
    "0.0.0.0/0"]
  ingress_rules = [
    "https-443-tcp",
    "http-80-tcp",
    "ssh-tcp",
    "all-icmp"]

  egress_with_cidr_blocks = [
    {
      rule = "all-all"
      cidr_blocks = "0.0.0.0/0"
    }
  ]
}
