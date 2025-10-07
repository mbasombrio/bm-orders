#!/bin/bash

# Build the project
echo "Building project..."
npx ionic build --prod --aot --configuration=production

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Build successful. Uploading to S3..."
    aws s3 cp ./www s3://preventa.buhomanager.com --recursive --acl public-read

    if [ $? -eq 0 ]; then
        echo "Upload completed successfully!"
    else
        echo "Upload failed!"
        exit 1
    fi
else
    echo "Build failed!"
    exit 1
fi
