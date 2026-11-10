/* Roast & Ritual: all content lives here. Every recipe is vegetarian (no egg). */
/* A step is either a string, or [text, seconds] when the step can be timed. */
window.RR = {
  regions: [
    { id:'ethiopia', name:'Ethiopia', tag:'Where the story began', alt:'1,500–2,200 m', process:'Natural & Washed',
      img:'images/ceremony.webp', notes:['Blueberry','Jasmine','Bergamot'], bars:{acidity:5,body:2,sweetness:4},
      text:'Legend says a goat herder named Kaldi noticed his goats dancing after eating red cherries. Whatever the truth, Ethiopia is where coffee began. The cups are light, floral and fruity. In a traditional coffee ceremony the beans are roasted right in front of you and the smoke fills the room.',
      best:'Pour-over and V60' },
    { id:'colombia', name:'Colombia', tag:'Balanced and sweet', alt:'1,200–2,000 m', process:'Washed',
      img:'images/origin.webp', notes:['Caramel','Red apple','Cocoa'], bars:{acidity:3,body:3,sweetness:4},
      text:'Hand-picked on steep mountain slopes. Two harvests a year mean fresh coffee almost all year round. The taste is sweet and rounded, never harsh: the easiest origin to love every single day.',
      best:'Latte, filter, French press' },
    { id:'brazil', name:'Brazil', tag:'The world’s biggest grower', alt:'800–1,300 m', process:'Natural',
      img:'images/cherries.webp', notes:['Hazelnut','Dark chocolate','Peanut brittle'], bars:{acidity:2,body:4,sweetness:4},
      text:'Brazil grows more coffee than any other country. The cherries dry whole in the sun (the natural process), which builds sweetness and body. It is the backbone of most espresso blends.',
      best:'Espresso, cappuccino, moka pot' },
    { id:'vietnam', name:'Vietnam', tag:'Bold, strong and sweet', alt:'500–1,500 m', process:'Robusta, Washed & Natural',
      img:'images/pourover.webp', notes:['Roasted nut','Cocoa','Bold'], bars:{acidity:1,body:5,sweetness:2},
      text:'The second-largest producer, and mostly robusta: strong, bold and high in caffeine. It is dripped slowly through a small steel phin filter and sweetened with condensed milk. That cup is called ca phe sua da.',
      best:'Phin filter, iced coffee' },
    { id:'india', name:'India', tag:'Grown in the shade of spices', alt:'800–1,500 m', process:'Washed, Natural, Monsooned',
      img:'images/filter.webp', notes:['Spice','Dark chocolate','Earthy'], bars:{acidity:2,body:4,sweetness:3},
      text:'Grown under shade in Chikmagalur, Coorg and Wayanad, among cardamom, pepper and banana trees. Monsooned Malabar is aged in damp monsoon winds for months. Legend says Baba Budan smuggled seven beans out of Yemen, and in the south, filter kaapi is a daily ritual.',
      best:'Filter kaapi, moka pot' },
    { id:'kenya', name:'Kenya', tag:'Bright, juicy, vivid', alt:'1,400–2,100 m', process:'Washed',
      img:'images/shelf.webp', notes:['Blackcurrant','Grapefruit','Tomato'], bars:{acidity:5,body:3,sweetness:3},
      text:'Red soil and high altitude give Kenyan coffee a vivid character: blackcurrant sweetness with a citrus snap. It is for people who want a cup that tastes like something unexpected.',
      best:'V60, AeroPress, cold brew' }
  ],

  roasts: [
    { name:'Light', temp:'196–205 °C', color:'#9a6a3f', acid:5, body:2, sweet:3,
      text:'Pale brown beans. Fruity, floral and bright. This is where the true character of the origin shows.',
      note:'Best for: pour-over, V60' },
    { name:'Medium', temp:'210–220 °C', color:'#6b4126', acid:3, body:3, sweet:4,
      text:'Balanced. Caramel, nutty and gently sweet. The one most people reach for.',
      note:'Best for: filter, drip, French press' },
    { name:'Medium-Dark', temp:'225–230 °C', color:'#442816', acid:2, body:4, sweet:3,
      text:'A light sheen of oil appears on the beans. Dark chocolate, toasty flavour and a deep body.',
      note:'Best for: espresso, moka pot, latte' },
    { name:'Dark', temp:'240 °C+', color:'#21130a', acid:1, body:5, sweet:2,
      text:'Glossy, oily beans. Smoky and bittersweet. You taste the roast more than the origin.',
      note:'Best for: espresso, cold coffee with milk' }
  ],

  /* Each section has two groups: a = no machine / no oven, b = with machine / oven or microwave. */
  recipes: {
    hot: {
      a: [
        { id:'h1', name:'Everyday Milk Coffee', time:'5 min', gear:'Saucepan & spoon', desc:'The cafe-style cup, made on your stove.',
          ing:['1 cup milk','1–1½ tsp instant coffee','1–2 tsp sugar','2 tbsp hot water'],
          steps:[['Mix the coffee, sugar and hot water in a cup. Beat with a spoon until it turns light and creamy.',60],['Heat the milk in a saucepan until steaming. Do not let it boil over.',120],'Pour the hot milk over the coffee paste.','Stir well and serve. A pinch of cinnamon on top is lovely.'] },
        { id:'h2', name:'South Indian Filter Kaapi', time:'25 min', gear:'Steel filter', desc:'Slow decoction, hot milk, and a frothy pour.',
          ing:['2 tbsp filter coffee powder (coffee-chicory blend)','½ cup boiling water','1 cup milk','Sugar to taste'],
          steps:['Add the powder to the upper chamber of the filter and press the disc down lightly.','Pour in the boiling water and close the lid.',['Wait for the decoction to drip down.',900],'Heat the milk and add sugar.','Mix 1 part decoction with 2–3 parts milk. Pour between two tumblers to make froth.'] },
        { id:'h3', name:'Masala Coffee', time:'8 min', gear:'Saucepan', desc:'Cardamom and cinnamon in a milky cup.',
          ing:['1 cup milk','½ cup water','2 tsp instant coffee (or 1½ tsp ground)','1 cardamom pod, crushed','¼ tsp cinnamon powder','2 tsp sugar'],
          steps:[['Boil the water with the cardamom and cinnamon.',120],'Add the milk and coffee.',['Simmer gently.',180],'Add the sugar, strain into a cup and serve.'] },
        { id:'h4', name:'Saucepan Coffee', time:'8 min', gear:'Saucepan & strainer', desc:'Ground coffee steeped right in the pot.',
          ing:['2 tbsp ground coffee (medium-coarse)','1½ cups water','Sugar or milk, optional'],
          steps:['Bring the water to a boil, then take it off the heat for 30 seconds.','Stir in the coffee.',['Let it steep.',240],'Splash in a little cold water to help the grounds settle.','Pour slowly through a strainer.'] },
        { id:'h5', name:'Jaggery Coffee', time:'6 min', gear:'Saucepan', desc:'Earthy sweetness, a pinch of dry ginger.',
          ing:['1 cup milk','1 tsp instant coffee','1 tsp grated jaggery','A pinch of dry ginger powder'],
          steps:['Heat the milk and stir in the coffee and ginger.','Take the pan off the heat.','Add the jaggery now. Adding it to boiling milk can curdle it.','Stir until it melts and serve.'] },
        { id:'h6', name:'Easy Mocha', time:'6 min', gear:'Saucepan & whisk', desc:'Chocolate and coffee in one mug.',
          ing:['1 cup milk','1 tbsp cocoa powder','1 tbsp sugar','1½ tsp instant coffee'],
          steps:['Whisk the cocoa, sugar and coffee with 2 tbsp hot milk into a smooth paste.',['Add the rest of the milk and heat gently.',180],'Stir well and pour into a mug. Top with chocolate shavings.'] }
      ],
      b: [
        { id:'h7', name:'V60 Pour-Over', time:'4 min', gear:'V60 dripper & kettle', desc:'A clean, bright cup. Ratio 1 : 16.',
          ing:['15 g medium-fine ground coffee','240 g water at 93 °C','Paper filter'],
          steps:['Rinse the paper filter with hot water and discard the water.',['Bloom: pour 30 g of water and wait.',45],['Pour slowly in circles up to 120 g.',30],['Keep pouring up to 240 g.',45],['Let it drain fully.',60]] },
        { id:'h8', name:'French Press', time:'6 min', gear:'French press', desc:'Full-bodied and rich. Ratio 1 : 15.',
          ing:['20 g coarse ground coffee','300 g water at 94 °C'],
          steps:['Add the coffee and pour in all the water.',['Put the lid on (plunger up) and steep.',240],'Break the crust on top with a spoon and skim off the foam.',['Plunge slowly and pour right away.',30]] },
        { id:'h9', name:'Moka Pot', time:'6 min', gear:'Moka pot & stove', desc:'Strong, espresso-style coffee on the stove.',
          ing:['18 g medium-fine ground coffee','180 ml hot water'],
          steps:['Fill the bottom chamber with hot water up to the valve.','Fill the basket with coffee, level it without pressing, and screw the pot shut.',['Heat on medium-low with the lid open.',180],'When it starts to gurgle, switch off the heat.','Cool the base under a wet cloth and serve.'] },
        { id:'h10', name:'AeroPress', time:'3 min', gear:'AeroPress', desc:'Smooth and quick, with very little cleanup.',
          ing:['15 g medium ground coffee','220 g water at 85 °C'],
          steps:['Set the AeroPress upside down. Add the coffee and the water.',['Stir for 10 seconds, then wait.',75],'Fit the filter cap and flip it onto your cup.',['Press down slowly.',30]] },
        { id:'h11', name:'Espresso Shot', time:'3 min', gear:'Espresso machine', desc:'The base for every cafe drink.',
          ing:['18 g fine ground coffee','About 36 g of espresso in the cup'],
          steps:['Grind fresh, fill the portafilter and tamp it level.','Lock it in and start the shot.',['Stop when you have around 36 g in the cup.',28]] },
        { id:'h12', name:'Cafe Latte', time:'5 min', gear:'Espresso machine & steam wand', desc:'One shot, silky steamed milk.',
          ing:['1 espresso shot','180 ml cold milk'],
          steps:['Pull a shot into a wide cup.','Steam the milk until it is hot and velvety, around 60–65 °C.','Pour the milk in a steady stream, finishing with a little foam on top.'] }
      ]
    },
    cold: {
      a: [
        { id:'c1', name:'Jar-Shake Cold Coffee', time:'5 min', gear:'Jar with a lid', desc:'No blender needed. Shake it frothy.',
          ing:['2 tsp instant coffee','2 tsp sugar','2 tbsp warm water','1 cup cold milk','Ice cubes'],
          steps:['Dissolve the coffee and sugar in the warm water inside the jar.','Add the milk and a few ice cubes.',['Close the lid tight and shake hard.',30],'Pour over fresh ice and serve.'] },
        { id:'c2', name:'Dalgona Coffee', time:'6 min', gear:'Bowl & whisk or spoon', desc:'Whipped coffee foam over cold milk.',
          ing:['2 tbsp instant coffee','2 tbsp sugar','2 tbsp hot water','Cold milk','Ice'],
          steps:['Put the coffee, sugar and hot water in a bowl.',['Whisk (a spoon works too) until thick, pale and fluffy.',240],'Fill a glass with ice and cold milk.','Spoon the foam on top and stir before drinking.'] },
        { id:'c3', name:'Quick Iced Coffee', time:'3 min', gear:'Glass & spoon', desc:'The fastest cold coffee there is.',
          ing:['2 tsp instant coffee','2 tbsp hot water','Sugar to taste','Ice','½ cup cold water or milk'],
          steps:['Dissolve the coffee and sugar in the hot water.','Fill a glass with ice.','Pour the coffee over the ice, add the cold water or milk and stir.'] },
        { id:'c4', name:'Ice Cream Coffee Float', time:'4 min', gear:'Glass & spoon', desc:'Strong coffee poured over vanilla ice cream.',
          ing:['1½ tbsp instant coffee','¼ cup hot water','2 scoops vanilla ice cream'],
          steps:['Dissolve the coffee in the hot water and let it cool for a few minutes.','Put the ice cream in a tall glass.','Pour the coffee over the top and eat with a spoon.'] },
        { id:'c5', name:'Sparkling Coffee Tonic', time:'4 min', gear:'Glass', desc:'Fizzy, citrusy and very refreshing.',
          ing:['2 tsp instant coffee','3 tbsp hot water','150 ml chilled soda or tonic water','Ice','A slice of lemon'],
          steps:['Dissolve the coffee in the hot water and let it cool.','Fill a glass with ice and pour in the soda.','Slowly pour the coffee on top so it floats.','Add the lemon slice.'] },
        { id:'c6', name:'Jar Cold Brew', time:'12 hours', gear:'Jar, fridge & a cloth', desc:'Slow, smooth and low in bitterness.',
          ing:['½ cup coarse ground coffee','2 cups cold water','Muslin cloth or a fine sieve'],
          steps:['Mix the coffee and water in a jar and cover it.','Leave it in the fridge for 12 hours.','Strain through the cloth or sieve.','Serve over ice, diluted 1 : 1 with water or milk. It keeps for about 5 days in the fridge.'] }
      ],
      b: [
        { id:'c7', name:'Blender Frappe', time:'5 min', gear:'Blender', desc:'Thick, frothy and cafe-style.',
          ing:['2 tsp instant coffee','1 cup cold milk','2 tsp sugar','1 cup ice','1 scoop vanilla ice cream'],
          steps:['Put everything in the blender.',['Blend until smooth and frothy.',30],'Pour into a tall glass.'] },
        { id:'c8', name:'Iced Latte', time:'4 min', gear:'Espresso machine', desc:'Espresso over milk and ice.',
          ing:['1 espresso shot','Ice','180 ml cold milk'],
          steps:['Fill a glass with ice and pour in the cold milk.','Pull a fresh espresso shot.','Pour the shot over the milk and stir.'] },
        { id:'c9', name:'French Press Cold Brew', time:'12 hours', gear:'French press', desc:'Cold brew with no straining mess.',
          ing:['100 g coarse ground coffee','800 g cold water'],
          steps:['Add the coffee and water to the press and stir.','Leave the lid on (plunger up) in the fridge for 12–16 hours.','Plunge slowly.','Serve 1 part concentrate with 1 part water or milk over ice.'] },
        { id:'c10', name:'Iced Americano', time:'3 min', gear:'Espresso machine', desc:'Sharp, clean and strong.',
          ing:['1–2 espresso shots','Ice','120 ml cold water'],
          steps:['Fill a glass with ice and add the cold water.','Pour the espresso on top.'] },
        { id:'c11', name:'Affogato', time:'4 min', gear:'Espresso machine', desc:'Hot espresso over cold vanilla ice cream.',
          ing:['1 hot espresso shot','1–2 scoops vanilla ice cream'],
          steps:['Put the ice cream in a small glass.','Pull the shot and pour it over right away.','Eat it before it melts.'] },
        { id:'c12', name:'Blender Mocha Shake', time:'5 min', gear:'Blender', desc:'Chocolate, coffee and ice cream.',
          ing:['1 cup cold milk','1½ tsp instant coffee','1 tbsp cocoa powder','2 tsp sugar','2 scoops chocolate ice cream','Ice'],
          steps:['Add everything to the blender.',['Blend until smooth.',40],'Pour and top with chocolate shavings.'] }
      ]
    },
    snacks: {
      a: [
        { id:'s1', name:'Masala Vada', time:'30 min', gear:'Kadhai', desc:'Crispy, savoury lentil fritters.',
          ing:['1 cup chana dal, soaked 2 hours','1 onion, chopped','2 green chillies','Small piece of ginger','Curry leaves','Salt','Oil for frying'],
          steps:['Grind the dal coarsely with no water.','Mix in the onion, chillies, ginger, curry leaves and salt.','Shape small flat patties.','Deep fry on medium heat until golden.','Serve hot.'] },
        { id:'s2', name:'Grilled Veg Sandwich', time:'10 min', gear:'Tawa', desc:'Green chutney, veggies and cheese.',
          ing:['2 slices of bread','Green chutney','Thin slices of cucumber, tomato and onion','1 cheese slice','Butter'],
          steps:['Spread chutney on a slice of bread.','Layer the vegetables and cheese.','Cover with a buttered slice.','Toast on a tawa on both sides, pressing down, until golden.','Cut diagonally.'] },
        { id:'s3', name:'Masala Makhana', time:'8 min', gear:'Kadhai', desc:'Light, crunchy fox nuts with spice.',
          ing:['2 cups makhana','1 tsp ghee','Salt','Black pepper','Chaat masala'],
          steps:['Heat the ghee in a kadhai.','Roast the makhana on low heat until crunchy.','Add salt, pepper and chaat masala and toss.','Let it cool before serving.'] },
        { id:'s4', name:'Cinnamon Butter Toast', time:'5 min', gear:'Tawa', desc:'Sweet, buttery and ready in minutes.',
          ing:['2 slices of bread','1 tbsp butter','1 tsp sugar','¼ tsp cinnamon powder'],
          steps:['Butter both slices.','Sprinkle the sugar and cinnamon on top.','Toast on a tawa until golden on both sides.','Cut diagonally and serve.'] },
        { id:'s5', name:'Eggless Pancakes', time:'15 min', gear:'Tawa', desc:'Soft and fluffy, no egg needed.',
          ing:['1 cup maida','1 tbsp sugar','1 tsp baking powder','¾ cup milk','1 tbsp oil'],
          steps:['Mix the dry ingredients.','Add the milk and oil and whisk into a smooth batter.','Pour small rounds onto a greased tawa.','Flip when bubbles appear on top.','Serve with honey or maple syrup.'] },
        { id:'s6', name:'Choco Oat Bites', time:'10 min + chilling', gear:'No cooking', desc:'No-bake energy bites.',
          ing:['1 cup oats','3 tbsp peanut butter','2 tbsp honey','1 tbsp cocoa powder'],
          steps:['Mix everything in a bowl until it sticks together.','Roll into small balls.','Chill in the fridge for 30 minutes.'] }
      ],
      b: [
        { id:'s7', name:'Eggless Choco Chip Cookies', time:'25 min', gear:'Oven', desc:'Buttery and crisp at the edges.',
          ing:['1 cup maida','¼ cup butter','⅓ cup sugar','2 tbsp milk','½ tsp baking powder','Chocolate chips'],
          steps:['Beat the butter and sugar until light.','Add the milk, then fold in the maida and baking powder.','Stir in the chocolate chips and shape small balls.','Bake at 180 °C for about 12 minutes.','Cool completely so they turn crisp.'] },
        { id:'s8', name:'Eggless Banana Bread', time:'50 min', gear:'Oven', desc:'Moist, sweet and perfect with coffee.',
          ing:['2 ripe bananas','½ cup sugar','⅓ cup oil','¼ cup curd','1½ cups maida','1 tsp baking soda','Chopped walnuts'],
          steps:['Mash the bananas and mix with the sugar, oil and curd.','Sift in the maida and baking soda and fold gently.','Add the walnuts and pour into a greased loaf tin.','Bake at 175 °C for 40–45 minutes.','A toothpick should come out clean.'] },
        { id:'s9', name:'Cheese Garlic Bread', time:'10 min', gear:'Oven or tawa', desc:'Garlicky, cheesy and quick.',
          ing:['4 slices of bread','2 tbsp butter','3 garlic cloves, crushed','Dried oregano','Grated cheese'],
          steps:['Mix the butter with the garlic and oregano.','Spread it on the bread and top with cheese.','Bake at 180 °C for 6 minutes, or cover on a tawa for 4 minutes.','Serve as soon as the cheese melts.'] },
        { id:'s10', name:'Mug Brownie', time:'5 min', gear:'Microwave', desc:'A brownie in a mug, in under two minutes.',
          ing:['4 tbsp maida','2 tbsp cocoa powder','3 tbsp sugar','¼ tsp baking powder','3 tbsp milk','2 tbsp oil','1 tbsp chocolate chips'],
          steps:['Mix all the dry ingredients in a mug.','Add the milk and oil and mix until smooth.','Drop in the chocolate chips.','Microwave for 70–90 seconds.','Rest for a minute and eat it warm.'] },
        { id:'s11', name:'Veg Nachos', time:'5 min', gear:'Microwave', desc:'Cheesy chips with fresh salsa.',
          ing:['Nacho chips','Grated cheese','Chopped tomato and onion salsa','Sliced jalapeños'],
          steps:['Spread the chips on a plate and add cheese and jalapeños.','Microwave for about 40 seconds.','Top with the salsa and serve.'] },
        { id:'s12', name:'Eggless Tea Cake', time:'45 min', gear:'Oven', desc:'A plain, soft cake for dunking.',
          ing:['1 cup maida','½ cup powdered sugar','⅓ cup oil','½ cup curd','½ tsp baking soda','1 tsp baking powder','¼ cup milk','1 tsp vanilla'],
          steps:['Whisk the curd, sugar and oil until smooth.','Sift in the maida, baking soda and baking powder and fold.','Add the vanilla and enough milk to get a dropping batter.','Pour into a greased tin.','Bake at 175 °C for 30–35 minutes until a toothpick comes out clean.'] }
      ]
    }
  },

  /* Pairs link a coffee recipe to a snack recipe by id. */
  pairs: [
    { coffee:'h2', snack:'s1', why:'Salty, crunchy vada against sweet, milky kaapi. A South Indian classic.' },
    { coffee:'h1', snack:'s7', why:'Warm milk coffee and a buttery cookie. Pure comfort.' },
    { coffee:'h3', snack:'s8', why:'Cardamom and cinnamon love the sweetness of ripe bananas.' },
    { coffee:'c1', snack:'s2', why:'A cold, sweet coffee next to a hot, savoury sandwich.' },
    { coffee:'c2', snack:'s3', why:'Creamy foam and crunchy makhana: texture heaven.' },
    { coffee:'c3', snack:'s6', why:'Sharp iced coffee with a soft, chocolatey bite.' }
  ],

  facts: [
    ['95 mg','in a 240 ml cup of brewed coffee (approx.)'],
    ['400 mg','daily limit generally considered safe for adults, about 4 cups'],
    ['5–6 hours','for your body to clear half of the caffeine'],
    ['~70','countries grow coffee, all inside the "Bean Belt"']
  ]
};
