import json
import requests

URL_QUERY_START_SUBSTR = 'https://services5.arcgis.com/54falWtcpty3V47Z/arcgis/rest/services/general_offenses_year2/FeatureServer/0/query?where='
URL_QUERY_END_SUBSTR = '&outFields=*&outSR=4326&f=json'
OFFENSE_CATEGORIES = [cat.lower() for cat in ["DANGEROUS DRUG", "SEXUAL OFFENSE", "SEX REGISTRATI", "STOLEN VEHICLE", "NARCOTICS", "NARCOTIC"]]

response = requests.get("https://services5.arcgis.com/54falWtcpty3V47Z/arcgis/rest/services/general_offenses_year2/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json")

json_data = json.loads(response.text)
crime_list = json_data["features"]
filtered_crime = set()
filtered_crime_string = ""
filtered_crime_num_string = ""

# Crime from year ago
for crime in crime_list:
    if crime["attributes"]["Offense_Category"].lower() in OFFENSE_CATEGORIES:
        grid_num = crime["attributes"]["Grid"]
        if grid_num != 'UI':
            filtered_crime.add(grid_num)
            # filtered_crime_num_string += f'{grid_num},'
            # filtered_crime_string += f'UPPER(Grid)%20like%20%27%25{grid_num}%25%27%20OR%20'

# Crime from current year
response = requests.get("https://services5.arcgis.com/54falWtcpty3V47Z/arcgis/rest/services/general_offenses_year3/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json")
json_data = json.loads(response.text)
crime_list = json_data["features"]

result_set = set()

for crime in crime_list:
    if crime["attributes"]["Offense_Category"].lower() in OFFENSE_CATEGORIES:
        grid_num = crime["attributes"]["Grid"]
        if grid_num in filtered_crime:
            if grid_num != 'UI':
                if grid_num not in result_set:
                    result_set.add(grid_num)
                    filtered_crime_num_string += f'\'{grid_num}\','
                filtered_crime_string += f'UPPER(Grid)%20like%20%27%25{grid_num}%25%27%20OR%20'

# print(f'{URL_QUERY_START_SUBSTR}{filtered_crime_string[:-8]}{URL_QUERY_END_SUBSTR}')
print(f'{filtered_crime_num_string[:-1]}')
