# %%

ssml="""<speak><prosody rate="slow">Hello</prosody></speak>"""

class SSMLTag:
    def __init__(self, name, attributes={}, content=None):
        self.name = name
        self.attributes = attributes
        self.content = content

    def __str__(self):
        attr_str = ' '+' '.join([f'{k}="{v}"' for k, v in self.attributes.items()])
        if self.content is None:
            return f'<{self.name}{attr_str} />'
        else:
            return f'<{self.name}{attr_str}>{self.content}</{self.name}>'

def parsetag(tagStr):
    tagStr = tagStr.strip()
    if(tagStr[-1] == '/'):
        tagStr = tagStr[:-1]

    tokens = tagStr.strip().split(' ')
    # print(tokens)
    name = tokens[0]
    atts = {}
    for t in tokens[1:]:
        key,val = t.split('=')
        atts[key] = val.strip('"')
    return SSMLTag(name,atts)


def parseSSML_recursive(ssml, parent):
    print("\nParsing", parent.name, ssml)
    while(len(ssml)):
        if(ssml[0] == '<'):
            i = 0
            while(i < len(ssml) and ssml[i] != '>'): i+=1
            tagStr = ssml[1:i]
            ssml = ssml[i+1:]
            if(tagStr[0] == '/'): # it's closing
                # print("closing", tagStr, parent)
                return ssml, parent
            node = parsetag(tagStr)
            if(tagStr[-1] != '/'):
                ssml, node = parseSSML_recursive(ssml, parent=node)
            print(parent.name, "==>", node)
        else:
            i = 0
            while(i < len(ssml) and ssml[i] != '<'): i+=1
            contentStr = ssml[0:i]
            ssml = ssml[i:]
            node = SSMLTag('text', content=contentStr)
            print(parent.name, "->", node)
        
node = parseSSML(ssml)
print(node)










