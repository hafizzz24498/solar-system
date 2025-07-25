type CardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bg?: string;
};

const Card = ({ title, value, icon, bg = "bg-white" }: CardProps) => {
  return <div className={`p-4 rounded shadow ${bg} `}>
    <div className="text-gray-600 text-sm">{title}</div>
    <div className="text-xl font-bold">{value}</div>
    <div className="text-yellow-400">{icon}</div>
  </div>;
};
export default Card;
