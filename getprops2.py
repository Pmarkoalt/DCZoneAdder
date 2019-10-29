
# coding: utf-8

# In[1]:


# %load selhtml2.py


# In[1]:


import time
import pandas as pd
from selenium import webdriver
from selenium.webdriver.support.ui import Select
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from pyvirtualdisplay import Display
from selenium import webdriver
from selenium.webdriver.chrome.options import Options


# In[7]:


options = Options()
options.add_argument("--no-sandbox") #This make Chromium reachable
options.add_argument("--no-default-browser-check") #Overrides default choices
#options.add_argument("--no-first-run")
#options.add_argument("--disable-default-apps") 
#options.add_argument("--start-maximized")
#options.add_argument("--disable-infobars")
#options.add_argument("--disable-extensions")
#options.add_argument("--single-process")
options.add_argument("--disable-setuid-sandbox")
options.add_argument("--headless")
options.add_argument('--dns-prefetch-disable')
print('hi',time.time())


# In[8]:


# In[2]:


#pd.set_option('display.max_columns', None)


# In[3]:


display = Display(visible=0, size=(800, 600))
display.start()
print('disp started')
#adbrowser = webdriver.Chrome(chrome_options=options, executable_path="/Users/bellman/bin/chromedriver")
adbrowser = webdriver.Chrome(chrome_options=options, executable_path=r"/usr/local/bin/chromedriver")
#adbrowser = webdriver.Chrome(chrome_options=options)
print('adbrowser launched')
#url = "http://mrislistings.mris.com/Matrix/Public/Portal.aspx?ID=0-4052246528-10#1"
url = 'https://matrix.brightmls.com/Matrix/Public/Portal.aspx?ID=0-462823255-10'
adbrowser.get(url)
print('sleep 1')
time.sleep(1)
print('wake')


# In[2]:


dflist = pd.read_html('https://matrix.brightmls.com/Matrix/Public/Portal.aspx?ID=0-462823255-10')


# In[3]:


adresses = list(dflist[15]['Address'])
prices = list(dflist[15]['Price'])


# In[4]:


pricedict={}
for i in zip(adresses,prices):
    pricedict[i[0]]=i[1]


# In[ ]:


adbrowser.close()


# In[9]:


# In[4]:


#browser = webdriver.Chrome('/usr/local/share/chromedriver')  # Optional argument, if not specified will search path.


# In[5]:


def getsrc(address,sleep_time):
    print('getsrc',address,'sleep time',sleep_time)
    browser = webdriver.Chrome(chrome_options=options, executable_path=r"/usr/local/bin/chromedriver")
    print('got browser')
    url = "http://propertyquest.dc.gov"
    browser.get(url) #navigate to the page
    browser.find_element_by_id('target')
    browser.find_element_by_id('target').send_keys(address)
    browser.find_element_by_id('searchButton').click()
    print('sleep_time',sleep_time)
    print('time before lookup',time.localtime(time.time()))
    time.sleep(sleep_time)
    print('time after lookup',time.localtime(time.time()))
    mytext = browser.page_source
    browser.close()
    return mytext


# In[6]:


def mytables(address,sleep_time=5):
    print('mytables',address)
    mytext = getsrc(address,sleep_time)
    tables = pd.read_html(mytext)
    return tables


# In[7]:


def getzone(tables):
    t0 = tables[0]
    zone = t0.loc[t0[0]=='Zoning',1].iloc[0]
    return zone


# In[8]:


def getsqf(tables):
    t1=tables[1]
    sqf = t1.loc[t1[0]=='Land area',1].iloc[0]
    return [int(i) for i in sqf.split() if i.isdigit()][0]


# In[9]:


def hasmins(adlist):
    considered = []
    for i in list(adlist):
        if getzone(adtables[i]) in list(codes.keys()):
            considered.append(i)
        else:
            continue
    return considered


# In[10]:


def goodprops(hasmins):
    goodprops = {'address':[],'zone':[],'min_size':[],'actual_size':[],'price':[]}
    for i in hasmins:
        try:
            minsize = codes[getzone(adtables[i])]
        except:
            continue
        try:
            actsize = getsqf(adtables[i])
        except:
            continue
        try:
            myzone = getzone(adtables[i])
        except: 
            continue
        myprice = pricedict[i]
        if actsize>minsize:
            try:
                goodprops['address'].append(i)
            except:
                continue
            try:
                goodprops['min_size'].append(minsize)
            except: 
                continue
            try:    
                goodprops['actual_size'].append(actsize)
            except:
                continue
            try:
                goodprops['zone'].append(myzone)
            except:
                continue
            goodprops['price'].append(myprice)
        else:
            continue
    df = pd.DataFrame(goodprops)
    df.set_index('address', inplace=True)
    return df


# In[11]:


def adtablesfun(adresses,sleep_time=5):
    notloaded = []
    adtables = {}
    for n,i in enumerate(adresses):
        print(n,': ',i)
        try:
            adtables[i]=mytables(i,sleep_time)
        except:
            notloaded.append(i)
            print('tables not loaded')
            continue
    return adtables, notloaded


# In[10]:


# In[12]:

mytables(adresses[0])


# In[ ]:


adtables,notloaded = adtablesfun(adresses[:20],sleep_time=3)


# In[13]:


print('notloaded',notloaded)


# In[14]:


adtables2,notloaded2=adtablesfun(notloaded,sleep_time=10)
print('notloaded2',notloaded2)


# In[15]:


adtables.update(adtables2)


# In[ ]:


# In[16]:


codes = {
 'RF-1':2700,
'RF-2':2700,
'RF-3':2700,
'RF-4':2700,
'RA-1':2000,
'RA-2':1000,
'RA-3':1000,
'RA-4':1000,
'RA-5':1000,
'RA-6':2000,
'RA-7':1000,
'RA-8':1000,
'RA-9':1000,
'RA-10':1000,
'MU-1':0,
'MU-2':0,
'MU-3':0,
'MU-4':0,
'MU-5':0,
'MU-6':0,
'MU-7':0,
'MU-8':0,
'MU-9':0,
'MU-10':0,
'MU-11':0,
'MU-12':0,
'MU-13':0,
'MU-14':0,
'MU-15':0,
'MU-16':0,
'MU-17':0,
'MU-18':0,
'MU-19':0,
'MU-20':0,
'MU-21':0,
'MU-22':0,
'MU-23':0,
'MU-24':0,
'MU-25':0,
'MU-26':0,
'MU-27':0,
'MU-28':0,
'MU-29':0,
'MU-5A':0,
'MU-5B':0,
'R-1-A':15000, 
'R-1-B': 10000 ,
'R-2': 6000 ,
'R-3':4000,
'R-10': 19000, 
'R-11':15000 ,
'R-12':10000 ,
'R-13': 4000 ,
'R-14': 15000, 
'R-15': 10000 ,
'R-16': 10000 ,
'R-17': 4000 ,
'R-19': 10000, 
'CG-1':700,
'CG-2':700,
'CG-3':700,
'CG-4':700,
'CG-5':700,
'CG-6':700,
'CG-7':700,
'ARTS-1':700,
'ARTS-2':700,
'ARTS-3':700,
'ARTS-4':700,
'D-1-R':700,
'D-2':700,
'D-3':700,
'D-4':700,
'D-4-R':700,
'D-5':700,
'D-5-R':700,
'D-6':700,
'D-6-R':700,
'D-7':700,
'D-8':700,
'HE-1':700,
'HE-2':700,
'HE-3':700,
'HE-4':700,
'MU-5A':700,
'MU-5B':700,
'NC-1':700,
'NC-2':700,
'NC-3':700,
'NC-4':700,
'NC-5':700,
'NC-6':700,
'NC-7':700,
'NC-8':700,
'NC-9':700,
'NC-10':700,
'NC-11':700,
'NC-12':700,
'NC-13':700,
'NC-14':700,
'NC-15':700,
'NC-16':700,
'NC-17':700}


# In[ ]:


# In[17]:


def hashasnot(address_list):
    haszones = []
    nozones = []
    for i in address_list:
        try:
            getzone(adtables[i])
            haszones.append(i)
        except IndexError:
            nozones.append(i)
            continue
    return haszones,nozones


# In[18]:


haszones,nozones = hashasnot(adtables.keys())





hasminslist = hasmins(haszones)


# In[ ]:


# In[21]:


goodpropsdf = goodprops(hasminslist)


# In[22]:


goodpropsdf.to_csv('good_props.csv')


# In[23]:


print('good props:\n',goodpropsdf)


# In[ ]:


def add_priority(mystr):
    if mystr[:2]=='MU':
        return 2
    elif mystr[:2]=='RA':
        return 3
    elif mystr[:2]=='RF':
        return 5
    elif mystr[0]=='R':
        return 4
    else:
        return 1


# In[ ]:


goodpropsdf['rank']=[add_priority(i) for i in goodpropsdf.zone]
goodpropsdf.sort_values(by='rank')


# In[ ]:


# In[24]:


gpstr = goodpropsdf.to_string()


# In[25]:


timestr = pd.datetime.now().strftime('%m/%d/%y %H:%M')


# In[26]:


def write_to_html_file(df, title='', filename='out.html'):
    '''
    Write an entire dataframe to an HTML file with nice formatting.
    '''

    result = '''
<html>
<head>
<style>

    h2 {
        text-align: center;
        font-family: Helvetica, Arial, sans-serif;
    }
    table { 
        margin-left: auto;
        margin-right: auto;
    }
    table, th, td {
        border: 1px solid black;
        border-collapse: collapse;
    }
    th, td {
        padding: 5px;
        text-align: center;
        font-family: Helvetica, Arial, sans-serif;
        font-size: 90%;
    }
    table tbody tr:hover {
        background-color: #dddddd;
    }
    .wide {
        width: 90%; 
    }

</style>
</head>
<body>
    '''
    result += '<h2> %s </h2>\n' % title
    result += df.to_html(classes='wide', escape=False)
    result += '''
</body>
</html>
'''
    with open(filename, 'w') as f:
        f.write(result)
        return result

gpstr = write_to_html_file(goodpropsdf, 'Filtered Properties '+timestr, 'fprop.html')

def myhtmlemail(mysubject,mybody,myfrom='goodpropsemail@gmail.com',myto='jessevbishop@gmail.com,csburns@gmail.com'):
    fromaddr = myfrom
    toaddr = myto
    #toaddr = "jessevbishop@gmail.com"
    msg = MIMEMultipart()
    msg['From'] = fromaddr
    msg['To'] = toaddr
    msg['Subject'] = mysubject
    body = gpstr
    
    msg.attach(MIMEText(mybody, 'html'))

    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(fromaddr, 'Balearic')
    text = msg.as_string()
    server.sendmail(fromaddr, toaddr.split(","), text)
    server.quit()



# In[27]:

mysub = "Filtered Properties " + timestr
mybody = gpstr
myhtmlemail(mysub,mybody)

