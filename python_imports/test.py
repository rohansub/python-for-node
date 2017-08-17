import numpy as np

def addArrays(arr1, arr2):
    ans = np.array(arr1) + np.array(arr2)
    return np.ndarray.tolist(ans)

def hello():
    return 'world'+'\n'
