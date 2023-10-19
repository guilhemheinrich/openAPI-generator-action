import main from './index'

const deepomics = "C:/Users/Zongo/Documents/Deepomics/Other/swagger_docs.json"
const dest_deepomics = "D:/code/DEEPOMICS/deepomics-python-client/src"
// main.init("D:/code/appeauPythonClient/swagger_docs_appeau.json", "D:/code/appeauPythonClient/appeau_client", "python")
// main.init("D:/code/appeauPythonClient/swagger_docs_appeau.json", "D:/code/appeau_Rclient/appeau_client", "R")
main.init(deepomics, dest_deepomics, "python")