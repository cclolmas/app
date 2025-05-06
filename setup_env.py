import subprocess
import sys

def install_requirements():
    """Install the required packages."""
    print("Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("Required packages installed successfully!")
    except subprocess.CalledProcessError:
        print("Failed to install required packages. Please install them manually.")
        return False
    return True

def setup_nltk():
    """Download required NLTK data."""
    print("Setting up NLTK data...")
    try:
        import nltk
        nltk.download('punkt')
        print("NLTK data downloaded successfully!")
    except Exception as e:
        print(f"Failed to download NLTK data: {e}")
        return False
    return True

if __name__ == "__main__":
    success = install_requirements()
    if success:
        setup_nltk()
        print("Environment setup completed!")
    else:
        print("Environment setup failed!")
