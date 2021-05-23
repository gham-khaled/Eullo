output "lb-id" {
  value = module.ec2_lb.instance-id
}
output "master-id" {
  value = module.ec2_master.instance-id
}
//output "node-1-id" {
//  value = module.ec2_master.instance-id
//}
//output "node-2-id" {
//  value = module.ec2_master.instance-id
//}
//
