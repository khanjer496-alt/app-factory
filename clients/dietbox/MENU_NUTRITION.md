# Menu nutrition review

The website menu is Diet Box's own talabat menu (68 dishes, photos included). Before launch, the kitchen or a dietitian needs to confirm every value below, and every allergen.

**How the website values were set**

- **Kept** the kitchen's listed calories, protein and carbs when they were plausible for the photographed portion. Missing fat was filled in so that calories = 4 × protein + 4 × carbs + 9 × fat (±3%). The unit tests enforce that rule for every dish.
- **Re-estimated** from the photo and a standard recipe when the listed values couldn't be right (for example, rice in the photo but 4 g carbs listed) or when nothing was listed.
- **Allergens** are inferred from the dish description and photo. They are the most important thing to verify: the site shows them to customers.
- **Programme portions:** Lean serves 0.85× and Muscle 1.3× of these values; Balance and Low Carb serve them as listed.

| Section | Dishes kept as listed (fat filled in) | Changed or estimated |
| --- | --- | --- |
| Breakfast | 4 | 9 |
| Lunch & dinner | 30 | 16 |
| Snacks | 0 | 9 |

Allergen key: gluten, dairy, egg, nuts (including peanuts), sesame, fish, shellfish.

## Breakfast

| Dish | talabat lists | Website (kcal · P · C · F) | Allergens | Why |
| --- | --- | --- | --- | --- |
| Halloumi Wrap | 344 kcal · P18 · C32 · F14 | 344 · 18g · 32g · 16g | gluten, dairy | fat set to 16 g so the energy adds up |
| Turkey & Cheese Sandwich | 332 kcal · P28 · C30 | 332 · 28g · 30g · 11g | gluten, dairy | fat filled in |
| Blueberry Pancakes | 315 kcal · P7 · C41 · F9 | 320 · 9g · 48g · 10g | gluten, egg, dairy | listed macros add up to 273 kcal; syrup and blueberries in the photo add carbs |
| Mushroom Omelette | 353 kcal · P22 · C34 | 348 · 24g · 18g · 20g | egg, dairy, gluten | 34 g carbs is too high for one slice of toast; eggs and cheese carry more fat |
| Oats with Strawberry | 290 kcal · P11 · C41 | 290 · 11g · 41g · 9g | gluten, dairy | fat filled in |
| Cheese French Toast | not listed | 385 · 19g · 32g · 20g | gluten, egg, dairy | estimated from photo |
| Spanish Omelette | 344 kcal · P22 · C29 | 322 · 22g · 18g · 18g | egg, dairy, gluten | 29 g carbs is too high for one slice of toast |
| Peanut Butter Toast | 200 kcal · P8 · C50 | 285 · 11g · 24g · 16g | gluten, nuts | 50 g carbs alone is 200 kcal; peanut butter adds fat |
| Labneh & Za'atar | 240 kcal · P13 · C34 | 242 · 13g · 34g · 6g | gluten, dairy, sesame | fat filled in |
| Egg & Cheese Bun | 330 kcal · P20 · C30 | 320 · 17g · 29g · 15g | gluten, egg, dairy | one egg in the photo; protein and fat adjusted |
| Egg & Cheese Wrap | 380 kcal · P24 · C31 | 380 · 24g · 31g · 18g | gluten, egg, dairy | fat filled in |
| Five-Egg Omelette | 424 kcal · P33 · C15 | 440 · 34g · 17g · 26g | egg, gluten | five whole eggs carry about 25 g fat |
| Egg-White Omelette | 230 kcal · P23 · C15 | 215 · 21g · 16g · 7g | egg, gluten | adjusted so the energy adds up |

## Lunch & dinner

| Dish | talabat lists | Website (kcal · P · C · F) | Allergens | Why |
| --- | --- | --- | --- | --- |
| Creamy Mushroom Chicken | not listed | 510 · 50g · 48g · 13g | dairy | estimated from photo |
| Chicken Biryani | 488 kcal · P44 · C42 | 488 · 44g · 42g · 16g | dairy | fat filled in |
| Butter Chicken | 570 kcal · P44 · C42 | 570 · 44g · 42g · 25g | dairy | fat filled in |
| Sweet & Spicy Chicken | 504 kcal | 500 · 40g · 46g · 17g | gluten | protein, carbs and fat estimated from the photo |
| Chicken Tikka | 455 kcal · P42 · C42 | 455 · 42g · 42g · 13g | dairy | fat filled in |
| Chicken Tikka Masala | 577 kcal | 576 · 42g · 48g · 24g | dairy | macros estimated for 150 g rice |
| BBQ Chicken | 542 kcal · P42 · C10 | 518 · 42g · 38g · 22g | none listed | 100 g rice alone is about 28 g carbs |
| Chicken Curry | 589 kcal · P47 · C42 | 590 · 47g · 42g · 26g | dairy | fat filled in |
| Grilled Chicken & Rice | 492 kcal · P40 · C4 | 499 · 54g · 46g · 11g | none listed | 4 g carbs ignores the 150 g rice in the photo |
| Dynamite Chicken | 460 kcal · P46 · C11 | 462 · 46g · 11g · 26g | gluten, egg | fat filled in |
| Grilled White Fish | 448 kcal · P40 · C46 | 452 · 40g · 46g · 12g | fish, dairy | fat filled in |
| Tuna Rice Bowl | 430 kcal | 428 · 35g · 45g · 12g | fish | protein, carbs and fat estimated from the photo |
| Shrimp Biryani | not listed | 459 · 35g · 55g · 11g | shellfish, dairy | estimated from photo |
| Meat Biryani | not listed | 606 · 44g · 58g · 22g | dairy | estimated from photo |
| Beef with Mushrooms | 566 kcal · P44 · C46 | 567 · 44g · 46g · 23g | dairy | fat filled in |
| Steak & Mash | 540 kcal · P43 · C30 | 544 · 43g · 30g · 28g | dairy | fat filled in |
| Butter Chicken Pasta | 612 kcal · P47 · C55 | 615 · 47g · 55g · 23g | gluten, dairy | fat filled in |
| Chicken Pasta, Rosé Sauce | 570 kcal · P48 · C51 | 570 · 48g · 51g · 19g | gluten, dairy | fat filled in |
| Buffalo Chicken Pasta | 614 kcal · P46 · C55 | 614 · 46g · 55g · 23g | gluten, dairy | fat filled in |
| Chicken Pasta, White Sauce | 548 kcal · P40 · C55 | 551 · 40g · 55g · 19g | gluten, dairy | fat filled in |
| Chicken Pasta, Red Sauce | 511 kcal · P44 · C48 | 512 · 44g · 48g · 16g | gluten, dairy | fat filled in |
| Shrimp Pasta, White Sauce | 519 kcal · P38 · C45 | 521 · 38g · 45g · 21g | gluten, dairy, shellfish | fat filled in |
| Shrimp Pasta, Rosé Sauce | 533 kcal · P44 · C51 | 533 · 44g · 51g · 17g | gluten, dairy, shellfish | fat filled in |
| Chicken Risotto | 594 kcal · P46 · C52 | 590 · 46g · 52g · 22g | dairy | fat filled in |
| Shrimp Risotto | 562 kcal · P39 · C52 | 562 · 39g · 52g · 22g | dairy, shellfish | fat filled in |
| Spaghetti Bolognese | 520 kcal · P41 · C48 | 518 · 41g · 48g · 18g | gluten, dairy | fat filled in |
| Chicken Lasagna | 613 kcal · P30 · C55 | 610 · 30g · 55g · 30g | gluten, dairy, egg | fat filled in |
| Classic Chicken Burger | 430 kcal · P35 · C30 | 431 · 35g · 30g · 19g | gluten, dairy, egg | fat filled in |
| Grilled Chicken Burger | 403 kcal · P34 · C18 | 390 · 36g · 30g · 14g | gluten, dairy, egg | the bun alone is about 28 g carbs |
| Mushroom Chicken Burger | 390 kcal · P35 · C30 | 386 · 35g · 30g · 14g | gluten, dairy, egg | fat filled in |
| Buffalo Chicken Burger | 466 kcal · P38 · C30 · F14 | 470 · 38g · 30g · 22g | gluten, dairy, egg | listed macros add up to 398 kcal; fat raised to match |
| Classic Beef Burger | 476 kcal · P34 · C31 | 476 · 34g · 31g · 24g | gluten, dairy, egg | fat filled in |
| Mushroom Beef Burger | 492 kcal · P36 · C38 | 494 · 36g · 38g · 22g | gluten, dairy, egg | fat filled in |
| Buffalo Chicken Wrap | 387 kcal · P34 · C31 | 386 · 34g · 31g · 14g | gluten, dairy | fat filled in |
| Chicken Fajita Wrap | 377 kcal · P34 · C31 | 377 · 34g · 31g · 13g | gluten, dairy | fat filled in |
| Philly Cheese Steak Wrap | 423 kcal · P35 · C34 · F16 | 420 · 35g · 34g · 16g | gluten, dairy | as listed |
| Beef Sandwich | 488 kcal · P35 · C38 | 490 · 35g · 38g · 22g | gluten, dairy | fat filled in |
| Chicken Wrap | 360 kcal · P30 · C30 | 357 · 30g · 30g · 13g | gluten, dairy | fat filled in |
| Chicken Sandwich | 455 kcal · P37 · C38 | 453 · 37g · 38g · 17g | gluten, dairy | fat filled in |
| Tuna Sandwich | 340 kcal · P32 · C29 | 343 · 32g · 29g · 11g | gluten, fish | fat filled in |
| Chicken Tikka Caesar | 230 kcal · P30 · C3 | 411 · 48g · 12g · 19g | gluten, dairy, egg, fish | the photographed portion of chicken, croutons and dressing is about 410 kcal |
| Chicken Caesar | 225 kcal · P30 · C3 | 402 · 48g · 12g · 18g | gluten, dairy, egg, fish | the photographed portion of chicken, croutons and dressing is about 400 kcal |
| Chicken Caesar Pasta Salad | 270 kcal · P31 · C25 | 415 · 40g · 30g · 15g | gluten, dairy, egg, fish | pasta, chicken and dressing in the photo add up to about 415 kcal |
| Tuna Caesar | 190 kcal · P24 · C11 | 318 · 36g · 12g · 14g | gluten, dairy, egg, fish | the photographed tuna portion and dressing add up to about 320 kcal |
| Low-Carb Chicken Salad | not listed | 403 · 46g · 12g · 19g | none listed | estimated from photo |
| Tuna Salad | not listed | 312 · 33g · 18g · 12g | fish | estimated from photo |

## Snacks

| Dish | talabat lists | Website (kcal · P · C · F) | Allergens | Why |
| --- | --- | --- | --- | --- |
| Greek Salad | not listed | 207 · 8g · 10g · 15g | dairy | estimated from photo |
| Green Salad | not listed | 134 · 4g · 16g · 6g | none listed | estimated from photo |
| Tabbouleh | not listed | 149 · 3g · 14g · 9g | gluten | estimated from photo |
| Rocket Salad | 172 kcal · P6 | 173 · 6g · 8g · 13g | dairy, nuts | carbs and fat filled in |
| Energy Balls | 118 kcal · P4 · C15 · F3 | 121 · 4g · 15g · 5g | nuts | fat adjusted so the energy adds up |
| Brownies | 332 kcal · P3 · C3 · F5 | 328 · 6g · 40g · 16g | gluten, egg, dairy | 3 g carbs is not possible for two brownie squares |
| Fudge Chocolate Cookies | not listed | 298 · 5g · 38g · 14g | gluten, egg, dairy | estimated from photo |
| Chocolate Chip Cookie | not listed | 277 · 4g · 36g · 13g | gluten, egg, dairy | estimated from photo |
| Vanilla Cake | 320 kcal · P7 · C35 · F9 | 316 · 7g · 45g · 12g | gluten, egg, dairy | listed macros add up to 249 kcal; carbs raised to match |

## Not in the plan menu

- **Grilled Salmon** (AED 61 on talabat): its cost is far above the other mains, so it's left out of the fixed-price plans. It could come back as a paid upgrade.
- **Sides** (white rice, mashed potatoes, grilled potatoes, mixed vegetables, raita) and **drinks**: these are add-ons, not plan meals.

## Low Carb programme

The menu has no true keto dishes, so the former Keto programme is now **Low Carb**: meals with 20 g of carbs or less. That gives 4 breakfasts, 6 mains and 4 snacks, so the Low Carb daily menu currently rotates through only those 6 mains. More low-carb mains (for example, rice swapped for salad) would give more variety.
