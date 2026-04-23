interface Props {
  title: string;
}

function Greeting({ title }: Props) {
  return <h2 data-testid="greeting">{title}</h2>;
}

export default Greeting;
