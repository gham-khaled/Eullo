locals {
  name = "eullo"
  region = var.region
  tags = {
    Owner = "khaled"
    Project = "Eullo"
    Environment = var.env
  }
}
############################################### VPC ##########################################################3

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"
  enable_nat_gateway = true
  single_nat_gateway = true
  one_nat_gateway_per_az = false
  reuse_nat_ips = true
  external_nat_ip_ids = aws_eip.nat.*.id
  name = local.name
  cidr = "10.0.0.0/22"
  azs = [
    "${local.region}b",
    "${local.region}c",
    "${local.region}a"]
  private_subnets = [
    "10.0.0.0/28",
    "10.0.1.0/28",
    "10.0.2.0/28",
  ]
  public_subnets = [
    "10.0.0.32/28"]
  enable_dhcp_options = true
  enable_flow_log = true
  create_flow_log_cloudwatch_log_group = true
  create_flow_log_cloudwatch_iam_role = true
  flow_log_max_aggregation_interval = 60
  enable_dns_hostnames = true
  tags = local.tags
}
resource "aws_db_subnet_group" "mysql_subnet_group" {
  name = "mysqlsubgroup"
  subnet_ids = [
    module.vpc.private_subnets[0],
    module.vpc.private_subnets[2],
    module.vpc.private_subnets[1]]
  tags = {
    Name = "Mysql subnet group"
  }
}
############################################### IP ##########################################################3
resource "aws_eip" "nat" {
  count = 2
  vpc = true
}
resource "aws_eip" "eip_assoc" {
  instance = module.ec2_ldap.id
  vpc = true
}
resource "aws_eip" "eip_assoc_chat_server" {
  instance = module.ec2_backend.id
  vpc = true
}
############################################### DB ##########################################################3

resource "aws_rds_cluster" "message_db" {
  cluster_identifier = "eullo-cluster"
  engine = "aurora-mysql"
  engine_version = "5.7.mysql_aurora.2.07.1"
  availability_zones = [
    "${local.region}b",
    "${local.region}a",
    "${local.region}c"]
  db_subnet_group_name = aws_db_subnet_group.mysql_subnet_group.name
  database_name = "eullo"
  master_username = "douda"
  skip_final_snapshot = true
  master_password = "douda123"
  apply_immediately = true
  enable_http_endpoint = true
  engine_mode = "serverless"
  vpc_security_group_ids = [
    module.db_sg.this_security_group_id]
  backup_retention_period = 0
}

############################################### Instances ##########################################################3
resource "aws_key_pair" "ssh-key" {
  key_name = "eullo"
  public_key = file("./keys/eullo.pub")
}

module "ec2_backend" {
  instance_type = "t2.micro"
  key = aws_key_pair.ssh-key.id
  name = "ChatServer"
  source = "./modules/ec2"
  private_ip = "10.0.0.38"
  subnet_id = module.vpc.public_subnets[0]
  vpc_security_group_ids = [
    module.ldap_sg.this_security_group_id]
}
module "ec2_ldap" {
  ami = "ami-087a5e4ed29d6c81d"
  name = "ldap"
  key = aws_key_pair.ssh-key.id
  source = "./modules/ec2"
  private_ip = "10.0.0.39"
  subnet_id = module.vpc.public_subnets[0]
  vpc_security_group_ids = [
    module.ldap_sg.this_security_group_id]
}

############################################### SG ##########################################################3

module "db_sg" {
  source = "terraform-aws-modules/security-group/aws"
  version = "~> 3.0"

  name = "aurora-sg-worker"
  description = "Security group for the Aurora Serverless master "
  vpc_id = module.vpc.vpc_id
  number_of_computed_ingress_with_source_security_group_id = 1
  computed_ingress_with_source_security_group_id = [
    {
      rule = "all-all"
      source_security_group_id = module.ldap_sg.this_security_group_id
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
    "ssh-tcp",
    "https-443-tcp",
    "http-80-tcp",
    "ldap-tcp"]
  egress_with_cidr_blocks = [
    {
      rule = "all-all"
      cidr_blocks = "0.0.0.0/0"
    }
  ]
}

############################################### OUTPUT ##########################################################3
resource "local_file" "instances-ids" {
  content = jsonencode(
  [
    module.ec2_ldap.instance-arn,
    //    module.ec2_backend.instance-arn
  ])
  filename = "instance-ids.txt"
}