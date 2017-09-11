const help = () => {
  
  console.log(
    `
      
NAME

  gist-file-sync - synchronize files over a github gist
      
SYNOPSIS

  gist-file-sync [-l] [-r] [--pull] [--push] [--token token] [--gist gist] [filepath]
      
DESCRIPTION

  Synchronizes your files in a predefined github gist. First you need to configure gist (id of newly created gist) and § (github api token with gist rights). If a file doesnt exist on your local machine, and exists in the gist, it will be downloaded. If it exists on your local machine and doesnt exist in the gist, it will be uploaded. Otherwise the newer file wins, unless explicit --pull or --push is specified.

OPTIONS
      
  -l
  
      List all files in the gist
      
  -r  filename
      
      Remove file from the gist
  
  --pull filepath
      
      Force a pull from the gist. The destination of the file can be specified with a path, e.g. ~/folder/file
        
  --push filepath
      
      Force a push to the gist
        
  --gist gist
      
      Set a gist to be used (id of the gist). This will be set in a .gist-file-sync file in the root directory
        
  --token token
      
      Set a token to be used. This will be set in a .gist-file-sync file in the root directory

EXAMPLES

  gist-file-sync -l
    Show remote files
    
  gist-file-sync ~/.bash_profile
    Synchronize a file
    
  gist-file-sync ~/.tmux.conf --pull
    Force pull from the gist
    
  gist-file-sync ~/.tmux.conf --push
    Force pull from the gist
    
  gist-file-sync .tmux.conf -r
    Remove remote file
    
  gist-file-sync --token foobar
    Set api token
    
  gist-file-sync --gist 123213
    Set gist id

    `
  )
  
}

module.exports = help