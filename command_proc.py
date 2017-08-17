import os
import json
import sys

import python_imports
from python_imports import *

# module = getattr(python_imports, 'test')
# method_to_call = getattr(module, 'addArrays')
# result = method_to_call([1,2],[2,3])
# print result

def call_func(j_msg):
    #get the function name
    func_str = j_msg['func_name']
    modules = func_str.split('.')

    func = python_imports
    for m in modules:
        func = getattr(func, m)

    ret_val = func(*j_msg['args'])

    #Need to convert return value to something parseable by json
    response = json.dumps({'id' : j_msg['id'], 'return_val' : ret_val})
    return response


while True:
    try:
        messages = raw_input().split('}\n')
        for msg in messages:
            j_msg = json.loads(msg)
            print call_func(j_msg)
            sys.stdout.flush()
    except EOFError:
        break
