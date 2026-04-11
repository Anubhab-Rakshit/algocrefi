#!/usr/bin/env python3
import subprocess
import sys
import os

os.chdir('/vercel/share/v0-project')

try:
    # Configure git user (since we're in a sandboxed environment)
    subprocess.run(['git', 'config', 'user.email', 'v0[bot]@users.noreply.github.com'], check=True)
    subprocess.run(['git', 'config', 'user.name', 'v0 Bot'], check=True)
    
    # Check git status
    print("[v0] Checking git status...")
    result = subprocess.run(['git', 'status'], capture_output=True, text=True)
    print(result.stdout)
    
    # Add all changes
    print("[v0] Adding all changes...")
    subprocess.run(['git', 'add', '.'], check=True)
    
    # Commit changes
    print("[v0] Committing changes...")
    commit_msg = "feat: Add AlgoCrefi dark-luxury DeFi landing page with React + Next.js\n\n- Loader component with SVG stroke animation\n- Custom cursor with magnetic interactions\n- Navbar with scroll hide/show and mobile hamburger\n- Hero section with clip-path text reveals and stat counters\n- Asymmetric bento grid with scroll reveals\n- Horizontal scroll 'How It Works' section\n- Aura credit score visualization\n- Stats ticker marquee\n- Diagonal footer with mobile responsive layout\n- Global design system with Space Grotesk and Inter fonts\n- Ambient orb drift animations and noise texture overlay\n\nCo-authored-by: v0[bot] <v0[bot]@users.noreply.github.com>"
    subprocess.run(['git', 'commit', '-m', commit_msg], check=True)
    
    # Push to the current branch
    print("[v0] Pushing to GitHub...")
    result = subprocess.run(['git', 'push', 'origin', 'HEAD'], capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print("[v0] Push stderr:", result.stderr)
    
    if result.returncode == 0:
        print("[v0] Successfully pushed to GitHub!")
    else:
        print(f"[v0] Push failed with return code {result.returncode}")
        sys.exit(1)
        
except subprocess.CalledProcessError as e:
    print(f"[v0] Error: {e}")
    print(f"[v0] Output: {e.stdout}")
    print(f"[v0] Stderr: {e.stderr}")
    sys.exit(1)
