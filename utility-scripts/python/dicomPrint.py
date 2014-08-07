import dicom
import os

DICOM_FILE_PATH = \
   "/Users/sunilkumar/Downloads/scans 18/12_ep2d_diff_mddw_4mm_ColFA/secondary"



def main():
    #---------------
    # Walk through DICOM_FILE_PATH, tracking the files
    #---------------
    files = []
    for (dirpath, dirnames, filenames) in os.walk(DICOM_FILE_PATH):
        for f in filenames:
            filename = os.path.join(dirpath, f)
            files.append(filename)

    #----------------
    # Process / Read the DICOM files
    #----------------
    dicomFiles = []
    for f in files:
        dicomFiles.append(dicom.read_file(f))

    print dicomFiles[len(dicomFiles) -1]



if __name__ == "__main__":
    main()
