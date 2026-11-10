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
})();
