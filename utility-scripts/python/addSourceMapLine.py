import sys, getopt

def main(argv):
    jsFile = ''
    sourceMapFile = ''

    try:
        opts, args = getopt.getopt(argv,"j:s:")
    except getopt.GetoptError:
        print 'addSourceMapLine.py -j <jsFile> -s <sourceMapFile>'
        sys.exit(2)
    #print opts
    for opt, arg in opts:
        #print opt, arg
        if opt == "-j":
            jsFile = arg
        elif opt == "-s":
            sourceMapFile = arg
    print 'JS file is ', jsFile
    print 'SourceMap file is ', sourceMapFile 

    #
    # read the file lines of the minified / compiled js
    #
    jsLines = [line for line in open(jsFile)]

    #
    # Add the sourcemapping line
    #
    jsLines += "//# sourceMappingURL=" + sourceMapFile


    _file = open(jsFile, "w")
    for line in jsLines:
        _file.write(line)
    _file.close()

if __name__ == "__main__":
    main(sys.argv[1:])
