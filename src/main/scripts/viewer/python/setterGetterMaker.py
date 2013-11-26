import sys
import os
import shutil
from datetime import datetime
  
        
        
hasGetter = True
hasSetter = True
isCallback = False

ITEM_NAME = "supendSlideCallbacks"
ITEM_TYPE = "boolean"
ITEM_DEFAULTER = "{}"

SETTER_ARGTYPE = "boolean"
SETTER_ARGNAME = "suspend"
SETTER_OPSTART = "="
SETTER_OPEND = ""

CLASS_NAME = "XtkHolder"


setGet = """
/**
* @private
* @type {ITEM_TYPE}
*/ 
CLASS_NAME.prototype.ITEM_NAME = ITEM_DEFAULTER;




/**
* @type {function(SETTER_ARGTYPE)}
*/ 
CLASS_NAME.prototype.SETTER_NAME = function(SETTER_ARGNAME){
this.ITEM_NAMESETTER_OPSTARTSETTER_ARGNAMESETTER_OPEND;
};




/**
* @type {function():ITEM_TYPE}
*/ 
CLASS_NAME.prototype.GETTER_NAME = function(){
return this.ITEM_NAME;
};
"""


capItemName = ITEM_NAME[0].upper() + ITEM_NAME[1:]
SETTER_NAME = "set" + capItemName
GETTER_NAME = "get" + capItemName

setGet = setGet.replace('CLASS_NAME', CLASS_NAME);
setGet = setGet.replace('ITEM_TYPE', ITEM_TYPE);
setGet = setGet.replace('SETTER_ARGTYPE', SETTER_ARGTYPE);
setGet = setGet.replace('SETTER_ARGNAME', SETTER_ARGNAME);
setGet = setGet.replace('SETTER_OPSTART', SETTER_OPSTART);
setGet = setGet.replace('SETTER_OPEND', SETTER_OPEND);
setGet = setGet.replace('ITEM_DEFAULTER', ITEM_DEFAULTER);
setGet = setGet.replace('ITEM_NAME', ITEM_NAME + "_");
setGet = setGet.replace('SETTER_NAME', SETTER_NAME);
setGet = setGet.replace('GETTER_NAME', GETTER_NAME);

print setGet
