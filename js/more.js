/* Extra recipes. Loaded after data.js and added to the same lists. All vegetarian, no egg. */
(() => {
  const R = window.RR.recipes;
  R.hot.a.push(
    { id:'h13', name:'Ethiopian-Style Spiced Coffee', time:'12 min', gear:'Saucepan & strainer', desc:'Inspired by the Ethiopian coffee ceremony: strong, spiced, shared.',
      ing:['3 tbsp ground coffee','2 cups water','1 cardamom pod, crushed','2 cloves','Small stick of cinnamon','Sugar to taste'],
      steps:['Bring the water to a boil with the cardamom, cloves and cinnamon.',['Simmer so the spices release their flavour.',120],'Take the pan off the heat and stir in the coffee.',['Let it steep.',240],'Strain into small cups and add sugar. Serve with a second round, as in the ceremony.'] },
    { id:'h14', name:'Ginger Coffee', time:'8 min', gear:'Saucepan', desc:'Warm, spicy and perfect for a cold evening.',
      ing:['1 cup water','Small piece of ginger, crushed','2 tsp instant coffee','1–2 tsp jaggery or sugar','A splash of milk, optional'],
      steps:[['Boil the water with the ginger.',180],'Switch off the heat and stir in the coffee.','Add the jaggery or sugar, and the milk if you like.','Strain into a cup and serve hot.'] },
    { id:'h15', name:'Colombian-Style Tinto', time:'8 min', gear:'Saucepan & strainer', desc:'Black coffee, lightly sweetened with jaggery.',
      ing:['2 tbsp ground coffee','1½ cups water','1 tbsp grated jaggery'],
      steps:['Bring the water and jaggery to a boil.','Take it off the heat and add the coffee.',['Stir and let it steep.',180],'Strain into small cups and serve.'] },
    { id:'h16', name:'Brazilian Cafezinho', time:'8 min', gear:'Saucepan & cloth or strainer', desc:'A small, strong and sweet cup, served after meals.',
      ing:['1½ cups water','2 tbsp sugar','3 tbsp ground coffee'],
      steps:['Boil the water with the sugar until it dissolves.','Take it off the heat and stir in the coffee.',['Let it rest for a moment.',60],'Strain through a cloth or fine strainer into small cups.'] },
    { id:'h17', name:'Condensed Milk Coffee (Hot)', time:'4 min', gear:'Cup & spoon', desc:'Sweet, creamy and very Vietnamese.',
      ing:['2 tbsp sweetened condensed milk','2 tsp instant coffee','150 ml hot water'],
      steps:['Put the condensed milk and coffee in a cup.','Pour in the hot water.','Stir until smooth and creamy.'] }
  );
  R.cold.a.push(
    { id:'c13', name:'Vietnamese Iced Coffee', time:'5 min', gear:'Glass & spoon', desc:'Ca phe sua da: strong coffee over sweet condensed milk and ice.',
      ing:['2 tbsp sweetened condensed milk','3 tsp instant coffee','60 ml hot water','Ice'],
      steps:['Put the condensed milk in a tall glass.','Dissolve the coffee in the hot water to make it strong and pour it over the milk.','Stir well.','Fill the glass with ice and stir again.'] }
  );

  /* ---- fill every toggle up to 12 recipes ---- */
  R.hot.a.push(
    { id:'h18', name:'Honey Cinnamon Coffee', time:'6 min', gear:'Saucepan', desc:'Soft sweetness from honey, warmth from cinnamon.',
      ing:['1 cup milk','1½ tsp instant coffee','1 tsp honey','¼ tsp cinnamon powder'],
      steps:[['Heat the milk with the cinnamon until steaming.',150],'Stir in the coffee until it dissolves.','Take it off the heat and let it cool for a minute.','Add the honey, stir and serve. Honey added to boiling milk loses its flavour.'] }
  );
  R.hot.b.push(
    { id:'h19', name:'Cappuccino', time:'5 min', gear:'Espresso machine & steam wand', desc:'Equal parts espresso, steamed milk and foam.',
      ing:['1 espresso shot','120 ml cold milk'],
      steps:['Pull a shot into a 150–180 ml cup.','Steam the milk until it is hot and thick with plenty of foam.','Pour the milk so the foam sits on top, about one third of the cup.','Dust with cocoa if you like.'] },
    { id:'h20', name:'Americano', time:'3 min', gear:'Espresso machine', desc:'Espresso lengthened with hot water.',
      ing:['1–2 espresso shots','150 ml hot water'],
      steps:['Pour the hot water into a cup first.','Pull the shot and pour it on top so the crema stays intact.'] },
    { id:'h21', name:'Flat White', time:'5 min', gear:'Espresso machine & steam wand', desc:'Smooth and strong, with thin velvety milk.',
      ing:['2 espresso shots (double)','120 ml cold milk'],
      steps:['Pull a double shot into a small cup.','Steam the milk gently, so it is hot with only a thin layer of microfoam.','Pour in a steady stream, finishing with a small white dot or heart.'] },
    { id:'h22', name:'Macchiato', time:'3 min', gear:'Espresso machine', desc:'Espresso "marked" with a spoon of milk foam.',
      ing:['1 espresso shot','1–2 tsp steamed milk foam'],
      steps:['Pull a shot into a small cup.','Steam a little milk and spoon only the foam on top.','Serve right away.'] },
    { id:'h23', name:'Drip Coffee Maker', time:'8 min', gear:'Automatic drip machine', desc:'Press a button, get a full pot.',
      ing:['30 g medium ground coffee','500 ml cold water','Paper filter'],
      steps:['Place the paper filter in the basket and add the coffee.','Pour the cold water into the tank.',['Switch it on and let the pot fill.',300],'Stir the pot once and pour.'] },
    { id:'h24', name:'Hot Mocha', time:'6 min', gear:'Espresso machine & steam wand', desc:'Espresso, chocolate and steamed milk.',
      ing:['1 espresso shot','1 tbsp cocoa powder','1 tbsp sugar','150 ml cold milk'],
      steps:['Mix the cocoa and sugar in a mug and pour the hot espresso over it. Stir into a paste.','Steam the milk until hot.','Pour the milk into the mug and stir.','Top with a little foam.'] }
  );
  R.cold.a.push(
    { id:'c14', name:'Iced Mocha (Jar Shake)', time:'5 min', gear:'Jar with a lid', desc:'Chocolate and coffee, shaken cold.',
      ing:['1½ tsp instant coffee','1 tbsp cocoa powder','2 tsp sugar','2 tbsp warm water','1 cup cold milk','Ice'],
      steps:['Mix the coffee, cocoa, sugar and warm water into a smooth syrup in the jar.','Add the milk and a few ice cubes.',['Close the lid and shake hard.',30],'Pour over fresh ice.'] },
    { id:'c15', name:'Coffee Lassi', time:'5 min', gear:'Glass & whisk', desc:'A cooling Indian take on cold coffee.',
      ing:['½ cup thick curd','½ cup cold water or milk','1 tsp instant coffee','1–2 tsp sugar','Ice'],
      steps:['Dissolve the coffee in a spoon of warm water.','Whisk the curd, cold water, sugar and coffee until smooth and frothy.',['Whisk well so it turns light.',60],'Pour over ice and serve.'] },
    { id:'c16', name:'Coffee Milkshake (Jar)', time:'6 min', gear:'Jar with a lid', desc:'Thick and creamy, no blender needed.',
      ing:['2 tsp instant coffee','2 tbsp hot water','1 cup cold milk','2 scoops vanilla ice cream','Sugar to taste'],
      steps:['Dissolve the coffee in the hot water and cool it.','Put the milk, ice cream and coffee in a jar.',['Shake hard until mostly smooth.',45],'Pour into a tall glass.'] },
    { id:'c17', name:'Coffee Ice Cube Latte', time:'4 hours + 3 min', gear:'Ice tray & glass', desc:'Frozen coffee cubes, so the drink never gets watery.',
      ing:['1 cup strong coffee, cooled','1 cup cold milk','Sugar to taste'],
      steps:['Pour the cooled coffee into an ice tray and freeze for about 4 hours.','Fill a glass with the coffee cubes.','Pour in the cold milk and sweeten if you like.','Stir and wait a minute as the cubes melt into the milk.'] },
    { id:'c18', name:'Mint Coffee Cooler', time:'5 min', gear:'Glass & spoon', desc:'Fresh mint and soda over strong coffee.',
      ing:['2 tsp instant coffee','3 tbsp hot water','8 mint leaves','1 tsp sugar','Ice','120 ml chilled soda'],
      steps:['Crush the mint with the sugar at the bottom of a glass.','Dissolve the coffee in the hot water, let it cool and pour it in.','Fill the glass with ice.','Top up with the chilled soda and stir gently.'] }
  );
  R.cold.b.push(
    { id:'c19', name:'Banana Coffee Smoothie', time:'5 min', gear:'Blender', desc:'A filling breakfast coffee.',
      ing:['1 ripe banana','1 tsp instant coffee','1 cup cold milk','1 tsp honey','Ice'],
      steps:['Add everything to the blender.',['Blend until smooth.',40],'Pour and serve at once.'] },
    { id:'c20', name:'Coffee Slush', time:'6 min', gear:'Blender', desc:'Icy and refreshing, like a coffee granita.',
      ing:['1 cup strong coffee, cooled','2 tbsp sugar','2 cups ice','A splash of milk'],
      steps:['Put the coffee, sugar and ice in the blender.',['Blend until it turns into a thick slush.',40],'Pour into a glass and add a splash of milk on top.'] },
    { id:'c21', name:'Cold Foam Iced Latte', time:'6 min', gear:'Milk frother', desc:'Iced coffee topped with a cloud of cold foam.',
      ing:['1 espresso shot or ½ cup strong coffee','Ice','½ cup cold milk','3 tbsp cold milk for the foam','1 tsp sugar'],
      steps:['Fill a glass with ice and add the cold milk, then pour the coffee over it.','Froth the 3 tbsp of milk with the sugar until thick.',['Froth for about 30 seconds.',30],'Spoon the foam on top.'] },
    { id:'c22', name:'Peanut Butter Coffee Shake', time:'5 min', gear:'Blender', desc:'Rich, nutty and a little salty.',
      ing:['1 tbsp peanut butter','1 tsp instant coffee','1 cup cold milk','1 tbsp honey','Ice'],
      steps:['Add everything to the blender.',['Blend until completely smooth.',40],'Pour into a glass.'] },
    { id:'c23', name:'Cold Brew Tonic', time:'3 min', gear:'Glass (cold brew made ahead)', desc:'Cold brew and tonic water over ice, with a twist of orange.',
      ing:['60 ml cold brew concentrate','120 ml chilled tonic water','Ice','A strip of orange peel'],
      steps:['Fill a glass with ice and pour in the tonic water.','Pour the cold brew slowly over the top so it layers.','Twist the orange peel over the glass and drop it in.'] },
    { id:'c24', name:'Date Coffee Smoothie', time:'5 min', gear:'Blender', desc:'Naturally sweet, with no added sugar.',
      ing:['4 soaked dates, pitted','1 tsp instant coffee','1 cup cold milk','Ice'],
      steps:['Add the dates, coffee, milk and ice to the blender.',['Blend until smooth.',45],'Pour and serve cold.'] }
  );
  R.snacks.a.push(
    { id:'s13', name:'Bread Pakora', time:'20 min', gear:'Kadhai', desc:'Crisp gram-flour coated bread, perfect with hot coffee.',
      ing:['4 bread slices','1 cup besan','½ tsp red chilli powder','¼ tsp ajwain','Salt','Water','Oil for frying','Green chutney'],
      steps:['Mix the besan, chilli powder, ajwain and salt with water into a thick batter.','Spread chutney on a slice, top with another and cut into triangles.','Dip each triangle into the batter.','Deep fry on medium heat until golden and crisp.','Serve hot.'] },
    { id:'s14', name:'Masala Peanuts', time:'10 min', gear:'Kadhai', desc:'Crunchy peanuts with onion, tomato and spice.',
      ing:['1 cup roasted peanuts','1 small onion, finely chopped','1 small tomato, finely chopped','Chaat masala','Red chilli powder','Lemon juice','Chopped coriander'],
      steps:['Put the peanuts in a bowl.','Add the onion, tomato and coriander.','Sprinkle the chaat masala, chilli powder and a squeeze of lemon.','Toss and eat immediately so they stay crunchy.'] },
    { id:'s15', name:'Tawa Bread Pizza', time:'12 min', gear:'Tawa', desc:'A quick pizza without an oven.',
      ing:['2 bread slices','2 tbsp pizza sauce or tomato ketchup','Grated cheese','Chopped onion, capsicum and tomato','Oregano'],
      steps:['Toast one side of each slice on a tawa.','Spread sauce on the toasted side, then add vegetables and cheese.','Cover and cook on low heat until the cheese melts.','Sprinkle oregano and serve.'] },
    { id:'s16', name:'Sweet Corn Chaat', time:'10 min', gear:'Saucepan', desc:'Warm corn with butter, lemon and spice.',
      ing:['1 cup sweet corn kernels','1 tsp butter','Chaat masala','Black pepper','Lemon juice','Chopped onion and coriander'],
      steps:['Boil the corn in salted water until soft, then drain.','Toss with the butter while hot.','Add the chaat masala, pepper, onion and coriander.','Finish with lemon juice and serve warm.'] },
    { id:'s17', name:'Besan Chilla', time:'15 min', gear:'Tawa', desc:'A savoury gram flour pancake.',
      ing:['1 cup besan','¾ cup water','1 small onion, chopped','1 green chilli, chopped','Chopped coriander','¼ tsp ajwain','Salt','Oil'],
      steps:['Whisk the besan with the water into a smooth, pourable batter.','Mix in the onion, chilli, coriander, ajwain and salt.','Pour a ladle onto a greased tawa and spread it thin.','Cook until golden on both sides, drizzling a little oil.','Serve with chutney.'] },
    { id:'s18', name:'Peanut Chikki', time:'20 min', gear:'Saucepan', desc:'Crunchy peanut and jaggery brittle.',
      ing:['1 cup roasted peanuts, skinned','¾ cup jaggery','1 tsp ghee'],
      steps:['Grease a plate and a rolling pin with ghee.','Melt the jaggery on low heat until it bubbles. A drop dropped in cold water should turn hard.','Switch off the heat, stir in the peanuts quickly.','Pour onto the plate and roll out thin. Be careful, it is very hot.','Cut into pieces while still warm and let it set.'] }
  );
  R.snacks.b.push(
    { id:'s19', name:'Baked Sweet Potato Fries', time:'35 min', gear:'Oven', desc:'Crisp outside, soft inside.',
      ing:['2 sweet potatoes','1 tbsp oil','½ tsp paprika or chilli powder','Salt','Black pepper'],
      steps:['Cut the sweet potatoes into thin sticks.','Toss with the oil, spices and salt.','Spread on a tray in a single layer.','Bake at 210 °C for 25–30 minutes, turning once.','Serve hot with a dip.'] },
    { id:'s20', name:'Roasted Spiced Chickpeas', time:'35 min', gear:'Oven', desc:'A crunchy, protein-rich snack.',
      ing:['1 cup boiled chickpeas','1 tbsp oil','½ tsp chaat masala','½ tsp cumin powder','Chilli powder','Salt'],
      steps:['Pat the chickpeas completely dry.','Toss with the oil, spices and salt.','Spread on a tray.','Bake at 200 °C for 25–30 minutes, shaking the tray halfway.','Let them cool to turn crunchy.'] },
    { id:'s21', name:'Cheese Corn Toast', time:'12 min', gear:'Oven or microwave', desc:'Sweet corn and cheese on toast.',
      ing:['2 bread slices','¼ cup boiled sweet corn','Grated cheese','Chopped capsicum','Black pepper','Butter'],
      steps:['Butter the bread lightly.','Mix the corn, capsicum, pepper and some cheese.','Spread it on the bread and top with more cheese.','Bake at 200 °C for 8 minutes, or microwave for 1 minute, until the cheese melts.'] },
    { id:'s22', name:'Oats and Raisin Cookies', time:'25 min', gear:'Oven', desc:'Chewy cookies with a nutty bite.',
      ing:['1 cup oats','½ cup maida','⅓ cup butter','⅓ cup brown sugar','2 tbsp milk','½ tsp baking powder','2 tbsp raisins'],
      steps:['Beat the butter and sugar until creamy.','Add the milk, then the oats, maida and baking powder.','Fold in the raisins and shape small balls, pressing them flat.','Bake at 180 °C for 12–14 minutes.','Cool on the tray before moving.'] },
    { id:'s23', name:'Eggless Walnut Brownies', time:'35 min', gear:'Oven', desc:'Fudgy brownies, no egg needed.',
      ing:['¾ cup maida','½ cup cocoa powder','¾ cup sugar','½ cup oil','½ cup milk','1 tsp baking powder','½ cup chopped walnuts'],
      steps:['Mix the sugar, oil and milk until the sugar dissolves.','Sift in the maida, cocoa and baking powder and fold gently.','Add the walnuts and pour into a greased tin.','Bake at 175 °C for 25 minutes.','Cool before cutting into squares.'] },
    { id:'s24', name:'Vanilla Mug Cake', time:'5 min', gear:'Microwave', desc:'A single serving of soft vanilla cake.',
      ing:['4 tbsp maida','3 tbsp sugar','¼ tsp baking powder','3 tbsp milk','2 tbsp oil','½ tsp vanilla'],
      steps:['Mix the dry ingredients in a mug.','Add the milk, oil and vanilla and mix until smooth.','Microwave for 70–90 seconds.','Rest for a minute and eat warm.'] }
  );
})();
