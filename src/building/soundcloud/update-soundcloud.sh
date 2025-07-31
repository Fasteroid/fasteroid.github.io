git config --global user.email "223176432+fasteroidbot@users.noreply.github.com"
git config --global user.name "FasteroidBot"

cd src/building/soundcloud

mkdir -p __data
cd __data

# Initialize a new git repo in the subdirectory
git init
git remote add origin "https://x-access-token:$GITHUB_TOKEN@github.com/$GITHUB_REPOSITORY.git"

bun ../builder

# Add and commit the single file
git add "graph_soundcloud_v2.json"
git commit -m "update soundcloud graph"

# Force push to target branch
git push origin HEAD:data.soundcloud --force