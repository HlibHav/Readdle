# Tailwind CSS Quick Reference

> Keep this open while coding! 🚀

## 🎨 Colors

```
Backgrounds:    bg-primary  bg-neutral-100  bg-white  bg-success  bg-error
Text:           text-primary  text-neutral-600  text-white  text-success
Borders:        border-neutral-200  border-primary  border-error
```

## 📝 Typography

```
Headings:       text-display  text-heading-lg  text-heading  text-heading-sm
Body:           text-body-lg  text-body  text-body-sm  text-caption
Weights:        font-normal  font-medium  font-semibold  font-bold
```

## 📏 Spacing

```
Padding:        p-xs  p-sm  p-md  p-lg  p-xl  p-2xl
Margin:         m-xs  m-sm  m-md  m-lg  m-xl  m-2xl
Gap:            gap-xs  gap-sm  gap-md  gap-lg  gap-xl
Specific:       pt-md  pr-lg  pb-sm  pl-xl  px-md  py-lg
```

## 🧩 Components

```
Buttons:        btn-primary  btn-secondary  btn-ghost  btn-danger
                btn-sm  btn-lg
                
Cards:          card  card-hover  card-elevated

Inputs:         input-field  input-error

Badges:         badge-success  badge-warning  badge-error  badge-info  badge-neutral

Forms:          form-group  form-label  form-error  form-hint

Text Styles:    text-heading-page  text-heading-section
                text-body-primary  text-body-secondary
                text-caption-primary  text-caption-secondary

Lists:          list-unstyled  list-item

Dividers:       divider  divider-vertical

Loading:        skeleton
```

## 📐 Layout

```
Flexbox:        flex  flex-col  flex-row
                items-center  items-start  items-end
                justify-center  justify-between  justify-start  justify-end
                
Grid:           grid  grid-cols-1  grid-cols-2  grid-cols-3
                
Containers:     container-page  container-section

Spacing:        space-y-md  space-x-md  gap-md
```

## 📱 Responsive

```
Mobile First:   (default - no prefix)
Tablet:         md:flex-row  md:grid-cols-2  md:text-lg
Desktop:        lg:grid-cols-3  lg:px-lg  lg:text-xl
Large:          xl:grid-cols-4  xl:max-w-7xl

Hide/Show:      hidden  md:block  lg:flex
```

## 🎯 Common Patterns

### Card with Button
```html
<div class="card">
  <h3 class="text-heading-sm mb-sm">Title</h3>
  <p class="text-body-secondary mb-md">Description</p>
  <button class="btn-primary">Action</button>
</div>
```

### Flex Row (Space Between)
```html
<div class="flex items-center justify-between">
  <span>Left</span>
  <button class="btn-primary">Right</button>
</div>
```

### Grid Layout
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
  <div class="card">Item 1</div>
  <div class="card">Item 2</div>
  <div class="card">Item 3</div>
</div>
```

### Form Field
```html
<div class="form-group">
  <label class="form-label">Label</label>
  <input class="input-field" type="text">
  <p class="form-hint">Helper text</p>
</div>
```

### Status Badge
```html
<span class="badge-success">Active</span>
<span class="badge-error">Failed</span>
```

### List with Hover
```html
<div class="space-y-sm">
  <div class="list-item">Item 1</div>
  <div class="list-item">Item 2</div>
</div>
```

## 🔥 Pro Tips

1. **Always use component classes first**: `btn-primary` not `bg-blue-500 px-4 py-2 ...`
2. **Stick to the spacing scale**: `p-md` not `p-3`
3. **Use semantic colors**: `bg-primary` not `bg-blue-500`
4. **Test mobile first**: Start with mobile, then add `md:` and `lg:` prefixes
5. **Copy from examples**: Find similar patterns in existing code

## 📚 Need More Info?

- Full Guide: `DESIGN_SYSTEM.md`
- Architecture: `ARCHITECTURE.md`
- Tailwind Docs: https://tailwindcss.com/docs

