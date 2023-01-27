
FLG_A="FALSE"
FLG_B="FALSE"
FLG_C="FALSE"
PORT=8080
RUN_MODE="-d"

while getopts id:s:p: OPT
do
  case $OPT in
    "i" ) RUN_MODE="-it";;
    "d" ) FLG_A="TRUE" ; DATA_PATH=$(cd "$OPTARG" && pwd);;
    "p" ) PORT="$OPTARG" ;;
  esac
done

if [ "$FLG_A" = "FALSE" ]; then
    DATA_PATH=$(pwd)/public
    if [ ! -e $DATA_PATH ]; then
        mkdir -p $DATA_PATH
        mkdir -p $DATA_PATH/user1/dataset
        mkdir -p $DATA_PATH/user1/label
    fi
fi

echo "RUNNING Docker image"
echo "PORT: " $PORT
echo "PUBLIC DIR: " $DATA_PATH

nvidia-docker run $RUN_MODE -p $PORT:8080 -v $DATA_PATH:/var/public renom_tag_docker
