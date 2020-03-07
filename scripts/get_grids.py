import json
import requests

response = requests.get("https://services5.arcgis.com/54falWtcpty3V47Z/arcgis/rest/services/general_offenses_year2/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json")

offense_categories = [cat.lower() for cat in ["DANGEROUS DRUG", "HEALTH/SAFETY", "SAC CITY CODE", "OBSTRUCTING", "FRAUD"]]

json_data = json.loads(response.text)
crime_list = json_data["features"]
filtered_crime = []
filtered_crime_string = "UPPER(GRID)%20like%20%25%27"

for crime in crime_list:
    if crime["attributes"]["Offense_Category"].lower() in offense_categories:
        # filtered_crime.append(crime["attributes"]["Grid"] + "%25'%20OR%20UPPER(Grid)%20like%20'%25")
        filtered_crime_string += crime["attributes"]["Grid"] + "%25%27%20OR%20UPPER(GRID)%20like%20%27%25"

print(filtered_crime_string)


# UPPER(Grid)%20like%20'%25123%25'%20OR%20UPPER(Grid)%20like%20'%25224%25'

# https://services5.arcgis.com/54falWtcpty3V47Z/arcgis/rest/services/POLICE_GRIDS/FeatureServer/0/query?where=UPPER(GRID)%20like%20'%25123%25'&outFields=*&outSR=4326&f=json