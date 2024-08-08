#!/usr/bin/env python3

import json

# Function to read and save JSON without formatting
def read_and_save_json(input_file, output_file):
    # Read the JSON file
    with open(input_file, 'r') as infile:
        data = json.load(infile)
    
    # Save the JSON data without formatting
    with open(output_file, 'w') as outfile:
        json.dump(data, outfile, separators=(',', ':'))

# Example usage
input_file = 'theiacloud.json'
output_file = 'theiacloud-minify.json'
read_and_save_json(input_file, output_file)

print(f"JSON data has been saved to {output_file} without formatting.")
