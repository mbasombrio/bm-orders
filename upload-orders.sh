#!/bin/bash

# Function to get current version from package.json
get_current_version() {
    node -p "require('./package.json').version"
}

# Function to update version in package.json
update_package_version() {
    local new_version=$1
    # Use node to update package.json
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.version = '$new_version';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
}

# Function to increment version based on type
increment_version() {
    local version=$1
    local type=$2

    IFS='.' read -ra VERSION_PARTS <<< "$version"
    local major=${VERSION_PARTS[0]}
    local minor=${VERSION_PARTS[1]}
    local patch=${VERSION_PARTS[2]}

    case $type in
        major)
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        minor)
            minor=$((minor + 1))
            patch=0
            ;;
        patch)
            patch=$((patch + 1))
            ;;
    esac

    echo "$major.$minor.$patch"
}

# Function to determine version bump type from commits
get_version_bump_type() {
    local last_tag=$1

    # Get commits since last tag
    if [ -z "$last_tag" ]; then
        commits=$(git log --pretty=format:"%s")
    else
        commits=$(git log ${last_tag}..HEAD --pretty=format:"%s")
    fi

    # Check for breaking changes (major)
    if echo "$commits" | grep -qE "^[a-z]+(\(.+\))?!:|BREAKING CHANGE:"; then
        echo "major"
        return
    fi

    # Check for features (minor)
    if echo "$commits" | grep -qE "^feat(\(.+\))?:"; then
        echo "minor"
        return
    fi

    # Check for fixes (patch)
    if echo "$commits" | grep -qE "^fix(\(.+\))?:"; then
        echo "patch"
        return
    fi

    # Default to patch if no conventional commits found
    echo "patch"
}

# Main version management logic
echo "🔍 Analyzing commits for version bump..."

# Get the last tag
last_tag=$(git describe --tags --abbrev=0 2>/dev/null)

if [ -z "$last_tag" ]; then
    echo "No previous tags found. Starting from current version."
    last_tag=""
fi

# Get current version
current_version=$(get_current_version)
echo "Current version: $current_version"

# Determine version bump type
bump_type=$(get_version_bump_type "$last_tag")
echo "Detected change type: $bump_type"

# Calculate new version
new_version=$(increment_version "$current_version" "$bump_type")
echo "New version: $new_version"

# Update package.json
echo "📝 Updating package.json..."
update_package_version "$new_version"

# Commit version change
echo "💾 Committing version change..."
git add package.json
git commit -m "chore: bump version to $new_version

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Create git tag
echo "🏷️  Creating tag v$new_version..."
git tag -a "v$new_version" -m "Release version $new_version"

# Build the project
echo "🔨 Building project..."
npx ionic build --prod --aot --configuration=production

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful. Uploading to S3..."

    # Upload all files except index.html and ngsw.json
    aws s3 sync ./www s3://preventa.buhomanager.com --acl public-read --exclude "index.html" --exclude "ngsw.json" --delete

    # Upload index.html with no-cache headers
    aws s3 cp ./www/index.html s3://preventa.buhomanager.com/index.html --acl public-read --cache-control "no-cache, no-store, must-revalidate" --content-type "text/html"

    # Upload ngsw.json with no-cache headers
    aws s3 cp ./www/ngsw.json s3://preventa.buhomanager.com/ngsw.json --acl public-read --cache-control "no-cache, no-store, must-revalidate" --content-type "application/json"

    if [ $? -eq 0 ]; then
        echo "✅ Upload completed successfully!"
        echo ""
        echo "📦 Version deployed: $new_version"
        echo "⚠️  IMPORTANTE: Solicitar invalidación manual de CloudFront con path: /*"
        echo ""
        echo "📌 Don't forget to push the tag: git push origin v$new_version"
        echo ""
    else
        echo "❌ Upload failed!"
        exit 1
    fi
else
    echo "❌ Build failed!"
    exit 1
fi
