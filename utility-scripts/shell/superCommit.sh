read -p "Enter commit message: " MASTER_COMMIT
echo $MASTER_COMMIT
#exit 0

echo "\n\nGIT: SWITCHING TO XIMGVIEW 'master' BRANCH"
echo "-----------"
cd $XNATIMAGEVIEWER_HOME
git checkout master
echo "-----------"
echo 'SUCCESS!'

echo "\n\nGIT: Committing NRG-fork of XTK."
echo "-----------"
cd $XNATIMAGEVIEWER_HOME/src/main/scripts/X
git add -A
git commit -m "\"$MASTER_COMMIT\""
git push
echo "-----------"
echo 'SUCCESS!'
exit 0

echo "\n\nMIN: Creating new css min."
echo "-----------"
cd $XNATIMAGEVIEWER_HOME/utility-scripts/python
python cssSlimmer.py
echo "-----------"
echo 'SUCCESS!'

echo "\n\nMIN: Minifying xiv."
echo "-----------"
cd $XNATIMAGEVIEWER_HOME/src/main/scripts/viewer
sh writeDeps.sh
sh build-xiv.sh
echo "-----------"
echo 'SUCCESS!'

echo "\n\nGIT: UPDATING MASTER"
echo "-----------"
cd $XNATIMAGEVIEWER_HOME
git add -A
git commit -m "\"$MASTER_COMMIT\""
git push
echo "-----------"
echo 'SUCCESS!'
#exit 0

TMP="$XNATIMAGEVIEWER_HOME/../tmp"`date +%Y-%m-%d-%H-%M-%S`; 
echo 'Making temp dir: ' $TMP
mkdir $TMP


echo '\n\nCOPY ' $XNATIMAGEVIEWER_HOME ' TO ' $TMP
echo "-----------"
cp -r $XNATIMAGEVIEWER_HOME/* $TMP
ls -la
echo "-----------"
echo 'SUCCESS!'

echo "\n\nGIT: SWITCHING TO XIMGVIEW 'gh-pages' BRANCH"
echo "-----------"
cd $XNATIMAGEVIEWER_HOME
git checkout gh-pages
echo "-----------"
echo 'SUCCESS!'


echo "\n\nGIT: MODIFYING 'gh-pages' BRANCH"
echo "-----------"
git rm -r *
rm -R
cp -r $TMP/* $XNATIMAGEVIEWER_HOME 
mv $XNATIMAGEVIEWER_HOME/Demo.html $XNATIMAGEVIEWER_HOME/Demo.bkp
mv $XNATIMAGEVIEWER_HOME/Demo-min.html $XNATIMAGEVIEWER_HOME/Demo.html
git add -A
git commit -m "\"$MASTER_COMMIT\""
git push
ls -la $XNATIMAGEVIEWER_HOME
echo "-----------"
echo 'SUCCESS!'


echo "\n\nGIT: SWITCHING TO XIMGVIEW 'master' BRANCH"
echo "-----------"
cd $XNATIMAGEVIEWER_HOME
git checkout master
echo "-----------"
echo 'SUCCESS!'

#echo '\nRemoving temp dir: ' $TMP
#rm -rf $TMP
cd $XNATIMAGEVIEWER_HOME
