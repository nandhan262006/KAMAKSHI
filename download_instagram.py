import re
import os
import instaloader

def download_instagram_image(url, output_dir="./downloads"):
    # Initialize Instaloader
    L = instaloader.Instaloader(
        download_videos=False,
        download_video_thumbnails=False,
        save_metadata=False,
        post_metadata_txt_pattern=""
    )

    # Extract shortcode using regex
    pattern = r"/(?:p|reel|tv)/([A-Za-z0-9_-]+)"
    match = re.search(pattern, url)
    if not match:
        return "Invalid Instagram URL format."

    shortcode = match.group(1)

    try:
        # Login with credentials from environment variables
        username = os.environ.get("INSTAGRAM_USERNAME")
        password = os.environ.get("INSTAGRAM_PASSWORD")
        if username and password:
            try:
                L.login(username, password)
            except instaloader.exceptions.TwoFactorAuthRequiredException:
                code = input("Enter your Instagram 2FA code: ").strip()
                L.two_factor_login(code)
        else:
            print("No credentials set (INSTAGRAM_USERNAME/INSTAGRAM_PASSWORD). Proceeding anonymously.")

        # Fetch post metadata and download
        post = instaloader.Post.from_shortcode(L.context, shortcode)
        L.dirname_pattern = output_dir
        L.download_post(post, target=shortcode)
        return f"Successfully downloaded image from post: {shortcode}"
    except Exception as e:
        return f"Error downloading image: {str(e)}"


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python download_instagram.py <instagram_url> [output_dir]")
        sys.exit(1)
    url = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else "./downloads"
    print(download_instagram_image(url, out))
