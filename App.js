/******************************************************************************
 * Constants and Configurations
 *****************************************************************************/

 // Cache keys and default location
const CACHE_KEY_LAST_UPDATED = 'last_updated';
 
// Font name and size
const FONT_NAME = 'Menlo';
const FONT_SIZE = 10;

// Colors
const COLORS = {
  bg0: '#29323c',
  bg1: '#1c1c1c',
  meal: '#FF6663',
};


// Import and setup Cache
const Cache = importModule('Cache');
const cache = new Cache('tamuDiningHallMenuFinder');

// Fetch data and create widget
const data = await fetchData();
const widget = createWidget(data);

Script.setWidget(widget);
Script.complete();

/******************************************************************************
 * Main Functions (Widget and Data-Fetching)
 *****************************************************************************/

/**
 * Main widget function.
 * 
 * @param {} data The data for the widget to display
 */
function createWidget(data) {
  console.log(`Creating widget with data: ${JSON.stringify(data)}`);

  const widget = new ListWidget();
  const bgColor = new LinearGradient();
  bgColor.colors = [new Color(COLORS.bg0), new Color(COLORS.bg1)];
  bgColor.locations = [0.0, 1.0];
  widget.backgroundGradient = bgColor;
  widget.setPadding(10, 15, 15, 10);

  const stack = widget.addStack();
  stack.layoutVertically();
  stack.spacing = 4;
  stack.size = new Size(320, 0);

  // Line 0 - Last Login
  const timeFormatter = new DateFormatter();
  timeFormatter.locale = "en";
  timeFormatter.useNoDateStyle();
  timeFormatter.useShortTimeStyle();

  const lastLoginLine = stack.addText(`Last check: ${timeFormatter.string(new Date())}`);
  lastLoginLine.textColor = Color.white();
  lastLoginLine.textOpacity = 0.7;
  lastLoginLine.font = new Font(FONT_NAME, FONT_SIZE);
  
  // Line 1 - Meal Type and Dining Hall
	const mealTypeLine = stack.addText(`Commons Dining Hall - ${data.menu.mealType}`);
  mealTypeLine.textColor = Color.white();
  mealTypeLine.font = new Font(FONT_NAME, FONT_SIZE);

  // Line 2 - Input
	const menuItems = data.menu.menu.menu_items[0]
  menuItems.forEach(item => {
    let line = stack.addText(item)
  	line.textColor = new Color(COLORS.meal);
  	line.font = new Font(FONT_NAME, FONT_SIZE);
  })
  
  return widget;
}

/**
 * Fetch pieces of data for the widget.
 */
async function fetchData() {
  // Get the weather data
  const menu = await fetchMenu();


  // Get last data update time (and set)
  const lastUpdated = await getLastUpdated();
  cache.write(CACHE_KEY_LAST_UPDATED, new Date().getTime());

  return {
    menu,
    lastUpdated,
  };
}

/******************************************************************************
 * Helper Functions
 *****************************************************************************/

async function fetchMenu() {
  const currentTime = new Date().getHours();
  let mealType;
  if (currentTime >= 1 && currentTime < 10) {
    mealType =  "Breakfast";
  } else if (currentTime >= 10 && currentTime < 16) {
    mealType =  "Lunch"
  } else if (currentTime >= 17 && currentTime < 24 ) {
    mealType =  "Dinner";
  } else {
    mealType = "Breakfast";
  }

  const url = `http://api.lucagiannotti.com/commons/${mealType.toLocaleLowerCase()}`;
  const menu = await fetchJson(url);
  console.log(menu)


  return {
    menu,
    mealType
  }
}

//-------------------------------------
// Misc. Helper Functions
//-------------------------------------

async function fetchJson(url) {
    console.log(`Fetching url: ${url}`);
    const req = new Request(url);
    const resp = await req.loadJSON();
    return resp;
}

/**
 * Get the last updated timestamp from the Cache.
 */
async function getLastUpdated() {
  let cachedLastUpdated = await cache.read(CACHE_KEY_LAST_UPDATED);

  if (!cachedLastUpdated) {
    cachedLastUpdated = new Date().getTime();
    cache.write(CACHE_KEY_LAST_UPDATED, cachedLastUpdated);
  }

  return cachedLastUpdated;
}

