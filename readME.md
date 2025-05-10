### DishDive - Recipe Finder App

#### Overview
DishDive is a mobile recipe finder app that helps users explore delicious meals based on dietary preferences and nutritional goals. It features search, gluten-free filters, and calorie-based meal suggestions to provide personalized cooking ideas.

#### Features
- Browse a wide range of recipes
- Search for recipes by name or ingredient
- View detailed instructions and ingredients for each dish
- Explore gluten-free recipes
- Get calorie-based meal planning suggestions

#### Screens
- **HomeScreen**: Landing page showing featured or popular recipes
- **SearchScreen**: Lets users search for recipes by keywords
- **RecipeDetailsScreen**: Shows details of a selected recipe including ingredients, steps, and images
- **GlutenFreeScreen**: Lists recipes suitable for gluten-intolerant users
- **CaloriePlannerScreen**: Recommends meals based on user’s calorie goals

#### Project Colors
- **Primary**: `#FF6347` (Tomato Red) - Used for buttons, accents, and title bars
- **Secondary**: `#4682B4` (Steel Blue) - Used for headers and secondary accents
- **Neutral**: `#F5F5F5` (Whitesmoke) - Used for backgrounds (updated to `#000000` Black in GlutenFreeScreen)

#### Fonts
**Note**: The project currently uses system fonts with specific styles, as custom fonts (like Montserrat) were not loaded in the Expo Snack project. Below are the font styles used:
- **Title**: `fontSize: 24`, `fontWeight: 'bold'` (system font)
- **Header**: `fontSize: 20`, `fontWeight: '600'` (system font)
- **Regular**: `fontSize: 16`, `fontWeight: 'normal'` (system font)
- **Bold**: `fontSize: 16`, `fontWeight: 'bold'` (system font)

**Custom Fonts (Planned)**:
- **Title**: `Montserrat-Bold`
- **Header**: `Montserrat-SemiBold`
- **Regular**: `Montserrat-Regular`
- **Bold**: `Montserrat-Bold`

All font files are intended to be located in: `assets/fonts/` (currently empty in the project).

#### Tools
- **React Native**: Framework for building the mobile app
- **JSX**: For UI development
- **Figma/Adobe XD**: For screen prototyping
- **Expo**: For development and preview (link: https://snack.expo.dev/@mohamed_ezzat/dishdive)
- **Firebase**: Online database
#### Team
- Mohamed Hassan Mohamed Ahmed
- Ahmed Hassan Ibrahim
- Mohamed Ezzat Mohamed
- Ahmed Abdelgleel
- Ahmed Emad

#### How to run

```bash
npx init
npx expo start 
```