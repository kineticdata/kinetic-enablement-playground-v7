# Atoms

**Atoms are the styled building block components that are used to build larger components and pages.**

They define the styling and interactivity of the components so these things don't need to be replicated in multiple places, but are unopinionated in what data they will show or interact with.

---

One example is the `Menu` atom which provides the functionality for rendering a dropdown menu with a list of buttons or links. The atom handles the styling and functionality for rendering the floating menu element and its contents. To use `Menu`, you simply need to provide a list of links and buttons to render, and any configuration props for positioning and toggling the menu.

```jsx
// Simple Menu use case, with a Details link and a Delete button
<Menu
  alignment="end"
  items={[
    { label: 'Details', to: 'details' },
    { label: 'Delete', onClick: () => {} },
  ]}
>
  <button slot="trigger">Open Menu</button>
</Menu>
```

## Libraries Used

The functionality of atoms is built using [Ark UI](https://ark-ui.com/), a headless component library. The styling is done using [Tailwind CSS](https://tailwindcss.com/), a utility-first CSS framework (with come custom CSS for more complex interactions). This combination allows us to implement custom complex components without doing so from scratch, but still allows us to style them using our own design system.

## Slots Pattern

Atoms can sometimes be complex components with a nested hierarchy of elements. An example is the `Modal` which, which can be split into a trigger, title, body, and footer. We want these atoms to be easy to use, and don't want to require having to build out the entire hierarchy.

We've adopted a slots pattern, where the children you provide use a `slot` prop to define where they should be rendered inside the atom.

---

Let's look at what the structure of a modal might look like.

```
┌─────────────────┐
│ Trigger Button  │
└─────────────────┘

Modal:
┌───────────────────────────────┐
│ Header                        │
│ ┌─────────────────┐ ┌───────┐ │
│ │ Title           │ │ Close │ │
├─┴─────────────────┴─┴───────┴─┤
│ Body                          │
│                               │
├───────────────────────────────┤
│ Footer                        │
└───────────────────────────────┘
```

If using a library like `React Boostrap` or similar, using a modal would look like this, where you need to use specific child components to build out the DOM hierarchy, and overwriting the tag type adds additional work. For us to add styling at the atom level, we would also need to wrap each child component in our own custom components.

```jsx
// React Boostrap Modal
<Button onClick={handleShow}>Open Modal</Button>
<Modal show={show} onHide={handleClose}>
  <Modal.Header closeButton>
    <Modal.Title>Modal Title</Modal.Title>
  </Modal.Header>
  <Modal.Body as="form">Modal Body Component</Modal.Body>
  <Modal.Footer>Modal Footer Buttons</Modal.Footer>
</Modal>
```

When using our `Modal` atom, we didn't want to require building out the full DOM structure as that leads to more repeated code. Instead, our atoms define named "slots" which you can inject elements/components into. Let's look at how you would use the `Modal` atom for example.

```jsx
// Our Modal atom
<Modal title="Modal Title">
  <button slot="trigger">Open Modal</button>
  <form slot="body">Modal Body Content</form>
  <div slot="footer">Modal Footer Buttons</div>
</Modal>
```

We can pass in multiple children, each with a `slot` prop that tells the atom where to place that element.

### Composing Slots

Ark UI also provides functionality that our atoms use, which merges the slot wrapper with the element you provide, which allows us to define styles in the atoms, but still gives you the ability to select what tag/component you want to use, or what additional attributes/props you want to provide.

Our `Modal` atom can define the body slot using code that looks like this:

```jsx
<ark.div asChild className="p-4">
  {slots.body}
</ark.div>
```

If you then provide a slot as follows:

```jsx
<form slot="body" className="bg-base-100">
  Modal Body Content
</form>
```

The resulting DOM will be:

```jsx
<form className="p-4 bg-base-100">Modal Body Content</form>
```

This allows us to not have additional superfluous wrapper elements just to add styles and removes clutter in the DOM.

### React Components as Slots

While the examples above use HTML elements as the child slot elements, you can also use React components:

```jsx
<Modal title="Modal Title">
  <MyComponent slot="body" />
</Modal>
```

There are two important things to remember when you use a React component in a slot.

1. You need to pass through the props from the component into the element your component renders. As described in the above Composing Slots section, our atoms merge the Ark UI component with your slot component, and passing through the props is required to ensure that the atom works properly.
2. You need to use `forwardRef` to pass through the ref into the element your component renders. This is needed because function components cannot accept refs.

With these two requirements in mind, your React component should look like this:

```jsx
const MyComponent = forwardRef((props, ref) => {
  return (
    <form {...props} ref={ref}>
      Modal Body Content
    </form>
  );
});
```
