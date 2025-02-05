This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

TODO:

- prihlaseni a ukladani dle uzivatele
- vytvareni tvaru - done
- save& export menu - done
- pridat obrazky
- eraser - done
- zadavani jmena pro ulozeni
- noise brush
- vytvareni textu - done
- Hybani s textem
- Vyplnovani v carach
- vyplnovani (takovy ten kyblik) - don
- styl line
- k serveru se to pripojuje vickrat (mel bych to optimalizovat)

Image:

- mikro blackscreen pri hybani
- aby slo pridat a detekovat vic images
-

-kruy a ctverce udelam ze kdyz bude selectnuta dana tool zapisu si pri mouse downu cords a pak pri mouse up a ty od sebe odectu a to nastavim na size arc nebo rect

-sirka a vyska tvaru porad rozjebna

<!---
npm install canvasinput
npm install mongodb
npm install
npm install konva react-konva
npm install react-icons --save
npm install mongoose
npm install tailwindcss @tailwindcss/cli
npm install tailwindcss @tailwindcss/postcss postcss
npm install fabric
npm i @flaticon/flaticon-uicons

- git status (get status of changes)
- git pull (pull changes from main and merges them)
- git fetch (pull changes from mainwithout meging them)
- git clone repository-url (clones the repository to current folder on local machien)
- git add file (adds file tobe commited)
- git commit -m"message" (stages changes to local repository)
- git push (uploads the changes to github)
- git log (display commit history)




npm install --global windows-build-tools
npm install canvas
-->

function drawShape(event){
const {offsetX, offsetY} = getMousePos(event)
if (isDrawingShapes) {
const ctx = ctxRef.current
ctx.globalCompositeOperation="source-over";

      ctx.arc(offsetX, offsetY, 5, 0, Math.PI * 2);
      ctx.current  = ctx
    }

}

function createShape() {
const canvas = canvasRef.current
const ctx = ctxRef.current
console.log(shapeStartPoint)
const startX = shapeStartPoint["x"]
const startY = shapeStartPoint["y"]
const endX = shapeEndPoint["x"]
const endY = shapeEndPoint["y"]
ctx.beginPath()
console.log(startX, startY, (endX - startX), (endY - startY))
ctx.rect(startX, startY, (endX - startX), (endY - startY))
ctx.stroke()
ctxRef.current = ctx
}
function shapeDownHandle(event) {
setDrawingShapes(true)
const {offsetX, offsetY} = getMousePos(event)
setShapeStartPoint({ x: offsetX, y: offsetY });
const ctx = ctxRef.current
ctx.fillStyle = "black";
ctx.beginPath();
ctx.current = ctx
}
function shapeUpHandle(event) {
setDrawingShapes(false)
const ctx = ctxRef.current
ctx.fill();
ctx.current = ctx
/_
const {offsetX, offsetY} = getMousePos(event)
setShapeEndPoint({ x: offsetX, y: offsetY });
createShape()
_/
}
