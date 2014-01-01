import os
import operator


    
def main():


    scanCounter = {}

    
    #------------------------------------
    # MAIN PARAMS
    #------------------------------------
    scanPath = './NeuroMRT'

    
    #------------------------------------
    #  WALK THROUGH SCANS
    #------------------------------------   
    for root, dirs, files in os.walk(scanPath):
        #for f in files:
        #print root, len(files)
        scanCounter[root] = len(files)
            

    sorted_x = sorted(scanCounter.iteritems(), key=operator.itemgetter(1))

    for x in sorted_x:
        print x
    
    print "DONE"

    
if __name__ == "__main__":
    main()

