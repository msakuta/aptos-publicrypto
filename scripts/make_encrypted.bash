if [ $# -eq 0 ]; then
    echo "usage: $0 <filename>"
    exit 1
fi

input=$1
output="${input/\.pdf/\.enc}"
echo "$input -> $output"

openssl rand -hex -out randompassword 32
# TODO: use the reader-provided key to encrypt
openssl enc -p -aes-256-cbc -salt -in $input -out $output -pass file:./randompassword
