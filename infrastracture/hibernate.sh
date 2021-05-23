#!/bin/bash

stop_instances() {
  line="$(cat instance-ids.txt | tr -d []\" | tr , " ")"
  for var in $line; do
    id="$(echo $var | sed 's_.*/__g') "
    aws ec2 stop-instances --instance-ids $id --profile sandbox --hibernate &
  done
}
start_instances() {
  line="$(cat instance-ids.txt | tr -d []\" | tr , " ")"
  for var in $line; do
    id="$(echo $var | sed 's_.*/__g') "
    aws ec2 start-instances --instance-ids $id --profile sandbox &
  done
}
"$@"
