filename=$1
TARGET=${filename%.*}
#STYLE="./static/css/vpkely.css"
TEMPLATE=./templates/rpg.tpl
DEPTH=$2
shift;

if [[ $DEPTH == "" ]]; then
    DEPTH=2
fi

#--css=$STYLE
#tailwindcss --input STYLE.css --output "twd_${STYLE}.css" --cwd static/css/
#pandoc -s -V --highlight-style=pygments \ -f markdown+smart
pandoc -t html5 "${TARGET}.md" -o "${TARGET}.html" \
--toc --toc-depth $DEPTH --template $TEMPLATE #--data-dir=$DATADIR --template $TEMPLATE

echo -e "\n" $TARGET "\n" $STYLE "\n toc ${DEPTH} \n---- DONE!"


