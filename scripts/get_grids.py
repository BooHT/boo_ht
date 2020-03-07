import json
import requests

URL_QUERY_START_SUBSTR = 'https://services5.arcgis.com/54falWtcpty3V47Z/arcgis/rest/services/general_offenses_year2/FeatureServer/0/query?where='
URL_QUERY_END_SUBSTR = '&outFields=*&outSR=4326&f=json'

response = requests.get("https://services5.arcgis.com/54falWtcpty3V47Z/arcgis/rest/services/general_offenses_year2/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json")

offense_categories = [cat.lower() for cat in ["DANGEROUS DRUG", "HEALTH/SAFETY", "SAC CITY CODE", "OBSTRUCTING", "FRAUD"]]

json_data = json.loads(response.text)
crime_list = json_data["features"]
filtered_crime = []
filtered_crime_string = ""

for crime in crime_list:
    if crime["attributes"]["Offense_Category"].lower() in offense_categories:
        grid_num = crime["attributes"]["Grid"]
        # filtered_crime.append(crime["attributes"]["Grid"] + "%25'%20OR%20UPPER(Grid)%20like%20'%25")
        filtered_crime_string += f'UPPER(Grid)%20like%20%27%25{grid_num}%25%27%20OR%20'

print(f'{URL_QUERY_START_SUBSTR}{filtered_crime_string[:-8]}{URL_QUERY_END_SUBSTR}')
