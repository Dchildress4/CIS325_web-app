export default function Input(props) {
  return (
    <input
      {...props}
      className="w-full p-2 border rounded mb-2 focus:outline-blue-500"
    />
  );
}