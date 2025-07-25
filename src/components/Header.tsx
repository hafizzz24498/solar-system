const Header = () => {
    return (
    <div className="flex justify-between items-center p-4 shadow bg-white">
      <h1 className="text-lg font-semibold">Solar Installation Management</h1>
      <div>
        <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">New Installation</button>
      </div>
    </div>
  );
};

export default Header;
