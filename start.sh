PROJECT="../cashflow-holmes"
cp ./qa.env "${PROJECT}/.env"

cd $PROJECT
nodemon --watch src/
