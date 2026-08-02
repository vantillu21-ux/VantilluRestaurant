import json
import os

menu_file = os.path.join("frontend", "data", "menu.json")

with open(menu_file, "r", encoding="utf-8") as f:
    menu = json.load(f)

# "for any 2 veg mix biryani keep image of veg biryani"
# "for chicken dum biryani keep Kona Seema Kodi Biryani image"
# "interchange images of lollipop biryani and chicken fry piece biryani"
# "i have kept dal thadka image in public/ keep that and replace all egg specials with egg_burji iamge kept in public/"
# "then for boiled_egg keep boiled_egg iamge"
# "don't keep biryani images for curries or egg specials keep curry images only as per your knowledge"

# first, let's find the lollipop and fry piece biryani images
lollipop_img = ""
frypiece_img = ""
for item in menu:
    name = item["name"].lower()
    if "lollipop" in name and "biryani" in name:
        lollipop_img = item["image"]
    elif "fry piece" in name and "biryani" in name:
        frypiece_img = item["image"]

for item in menu:
    name = item["name"].lower()
    cat = item["category"].lower()
    
    if "2 veg mix" in name and "biryani" in name:
        item["image"] = "/veg_biryani.png"
    elif "chicken dum biryani" in name:
        item["image"] = "/premium_biryani.png"
    elif "lollipop" in name and "biryani" in name and frypiece_img:
        item["image"] = frypiece_img
    elif "fry piece" in name and "biryani" in name and lollipop_img:
        item["image"] = lollipop_img
    elif "dal thadka" in name or "dal tadka" in name:
        item["image"] = "/dal_thadka.png"
    elif "boiled egg" in name or name == "boiled egg":
        item["image"] = "/boiled_egg.png"
    elif cat == "egg specials":
        if "boiled egg" not in name:
            item["image"] = "/egg_burji.jpg"
    elif cat in ["veg curries", "non-veg curries", "seafood curries"]:
        # don't keep biryani images for curries, keep curry images as per knowledge
        # I'll replace any image having "biryani" in its URL to a generic curry image if available
        # or maybe the prompt just meant generally ensure curries don't have biryani image
        if "biryani" in item["image"].lower():
            if "veg" in cat:
                item["image"] = "/gutthi_vankaya.png"
            elif "non-veg" in cat:
                item["image"] = "/kodi_vepudu.png"
            elif "seafood" in cat:
                item["image"] = "/nellore_chepala_pulusu.png"

with open(menu_file, "w", encoding="utf-8") as f:
    json.dump(menu, f, indent=2)
print("Updated menu.json")
