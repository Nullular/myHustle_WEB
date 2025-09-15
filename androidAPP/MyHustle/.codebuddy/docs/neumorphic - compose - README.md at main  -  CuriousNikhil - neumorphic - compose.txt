From https://github.com/CuriousNikhil/neumorphic-compose/blob/main/README.md
Title: neumorphic-compose/README.md at main · CuriousNikhil/neumorphic-compose


Skip to content
Navigation Menu
CuriousNikhil
/
neumorphic-compose
Type / to search
Code
Issues
3
Pull requests
Discussions
Actions
Projects
Security
Insights
Files
 main
t
.github
app
gradle
library
scripts
static
.gitignore
LICENSE
README.md
build.gradle
gradle.properties
gradlew
gradlew.bat
settings.gradle
Breadcrumbs
neumorphic-compose
/README.md
Latest commit
CuriousNikhil
Update README.md
9ba7738
 · 
History
History
File metadata and controls
Preview
Code
Blame
128 lines (94 loc) · 5.99 KB
Code 55% faster with GitHub Copilot
Raw
Neumorphism UI with Jetpack Compose

This library is an experimentation with Neumorphism UI (New + Skeuomorphism) on Android with Jetpack Compose.

  

How to use?
1. Add the dependency

And your app level build.gradle. (Make sure you have compose dependencies as well)

  implementation("me.nikhilchaudhari:composeNeumorphism:1.0.0-alpha02")
2. Use

Just add modifier = Modifier.neumorphic() to any of your UI element of Jetpack-Compose (just like you do for other modifiers).

How do I configure shape, color, etc.?
1. Shapes

You've three basic Neu shapes available -

Punched, 2. Pressed, 3. Pot

These are not standard names for Neumorphism UI, I just named them based on how they look (at least to me).

And you can also configure the corner families of those shapes as Oval or Rounded

Card(
  backgroundColor = Color(236, 234, 235),
  shape = RoundedCornerShape(12.dp),
  modifier = Modifier
      .padding(16.dp)
      .size(300.dp, 100.dp)
      .neumorphic(
        neuShape = 
          // Punched shape
         Punched.Rounded(radius = 8.dp) 
         Punched.Oval()

         // Presssed Shape
         Pressed.Rounded(radius = 4.dp)
         Presssed.Oval()

        // Pot shape
        Pot.Rounded(radius = 8.dp)
        Pot.Oval()
      )
    ){/*card content */} 

For Rounded corner-family, you can configure the radius of how much rounded corner you want. The default Neu shape is Punched.Rounded(radius = 12.dp).
The Punched shape would work with Cards, Buttons, etc.
You should use Modifier.clip() while using Pressed shape, because there's known issue of shadow placeents for Pressed shape. Check the sample app for more code snippets.

P.S: Even I'm yet to experiment it with all UI elements.

2. Shadows

The idea of Neumorphism UI is simple, just create two shadows light and dark and draw those around the UI component from top-left and bottom-right corners.
Just make sure you are using the same colors for your Surface and for the UI elements. You can configure the shadow insets, color and elevation

Params	Description
lightShadowColor	Default value - Color.White - Set the light shadow color you want
darkShadowColor	Default value - Color.Gray - Set the dark shadow color you want.
elevation	Default value - 6.dp - Set the elevation for the shadow.
neuInsets	Default values - NeuInsets(6.dp, 6.dp) - Insets = Horizontal, Vertical - Placements of your shadows i.e How do you want to place your
strokeWidth	Default value - 6.dp - Stroke width of the internal shadows. Stroke width is for only Pressed and Punched.
  Button(
       onClick = { /*TODO*/ },
       modifier = Modifier
           .padding(12.dp)
           .neumorphic(
               // assing neuShape
               //...
               lightShadowColor = Color.White,
               darkShadowColor = Color.Gray,
               elevation = 4.dp,
               strokeWidth: Dp = 6.dp,
               neuInsets = NeuInsets(6.dp, 6.dp)
           )
   ) 

The overall configutation 

ToDos
 Add LightSource option and place the shadows accordingly (It is, by default, top-left right now)
 Migrate from RenderScript
 Fix clipping and shadow positioning with insets
 Update sample app and code with Jetpack-Compose guidelines
FAQs
What's the idea? Is there any performance overhead?

Idea is simple - just draw the two shadows light and dark around the UI element. I'm using RenderScript to blur two GradientDrawables. I know it's going to be deprecated in the Android 12. I'll surely update the code to migrate from RenderScript. If Renderscript throws any exception / not able to blur the drawable, I'm using StackBlur algorithm from Mario Klingemann as a workaround.

Does this library work with all the Jetpack Compose UI elements?

I can't surely say. I'm already experimenting drawing shadow on UIs with Jetpack Compose and improving this library. I request you to try and please help to make it work.

When can I use this?

You can use this right now if you want to play with shiny Neumorphism UI. The library is in alpha and there are some known issues regarding shadow rendering and clipping. Please raise issue if you found any.

Contribution Guide

Please contribute! I'm just getting my hands dirty with Jetpack-Compose.
There is heavy chance that the code may/may not be correct/holding best practices. I request you to contribute/ raise issues/ send PRs so I can learn too. You can use the Github Discussion to discuss and ask questions. Or you can reach out to me on Twitter @CuriousNikhil.

License

Licensed under Apache License, Version 2.0 here

CuriousNikhil (Nikhil Chaudhari)
 