#!/bin/bash

# Build the project
echo "Building project..."
npx ionic build --prod --aot --configuration=production

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "Build successful. Uploading to S3..."

    # Upload all files except index.html and ngsw.json
    aws s3 sync ./www s3://preventa.buhomanager.com --acl public-read --exclude "index.html" --exclude "ngsw.json" --delete

    # Upload index.html with no-cache headers
    aws s3 cp ./www/index.html s3://preventa.buhomanager.com/index.html --acl public-read --cache-control "no-cache, no-store, must-revalidate" --content-type "text/html"

    # Upload ngsw.json with no-cache headers
    aws s3 cp ./www/ngsw.json s3://preventa.buhomanager.com/ngsw.json --acl public-read --cache-control "no-cache, no-store, must-revalidate" --content-type "application/json"

    if [ $? -eq 0 ]; then
        echo "Upload completed successfully!"
        echo ""
        echo "⚠️  IMPORTANTE: Solicitar invalidación manual de CloudFront con path: /*"
        echo ""
    else
        echo "Upload failed!"
        exit 1
    fi
else
    echo "Build failed!"
    exit 1
fi
