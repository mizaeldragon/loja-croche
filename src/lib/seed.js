// Dados iniciais (seed) do ateliê — usados para popular o localStorage na primeira execução.
// Imagens locais de crochê em /public/images, alinhadas a cada título.

const local = (path) => `/images/${path}`

const ph = (w, h, bg, fg, text) =>
  `https://placehold.co/${w}x${h}/${bg}/${fg}?font=playfair-display&text=${encodeURIComponent(text)}`

export const PALETTE_BG = ['FDD7CA', 'CCAFA1', 'F5C4B4', 'FFF7F3', 'EAD9D0']
export const PALETTE_FG = ['1F2937', '111827', '4B5563']

export const seedCategories = [
  {
    id: 'cat_roupas',
    name: 'Roupas',
    slug: 'roupas',
    description: 'Blusas, tops e cardigans tramados à mão, com caimento leve e exclusivo.',
    image: local('categorias/roupas.jpg'),
    order: 1,
  },
  {
    id: 'cat_acessorios',
    name: 'Acessórios',
    slug: 'acessorios',
    description: 'Bolsas, chapéus e detalhes que completam o look com personalidade.',
    image: local('categorias/acessorios.jpg'),
    order: 2,
  },
  {
    id: 'cat_decoracao',
    name: 'Decoração',
    slug: 'decoracao',
    description: 'Peças para mesa e casa que trazem aconchego e charme artesanal.',
    image: local('categorias/decoracao.jpg'),
    order: 3,
  },
  {
    id: 'cat_enxovais',
    name: 'Enxovais',
    slug: 'enxovais',
    description: 'Kits e mantinhas delicadas para celebrar a chegada do bebê.',
    image: local('categorias/enxovais.jpg'),
    order: 4,
  },
  {
    id: 'cat_personalizados',
    name: 'Personalizados',
    slug: 'personalizados',
    description: 'Criações sob medida a partir da sua ideia, cor e ocasião.',
    image: local('categorias/personalizados.jpg'),
    order: 5,
  },
  {
    id: 'cat_presentes',
    name: 'Presentes',
    slug: 'presentes',
    description: 'Lembranças feitas à mão para presentear com carinho de verdade.',
    image: local('categorias/presentes.jpg'),
    order: 6,
  },
]

let _seq = 1
function prod({
  name,
  category,
  price,
  promoPrice = null,
  description,
  colors = [],
  sizes = [],
  stock = 12,
  featured = false,
  bestseller = false,
  isNew = false,
  tags = [],
  images = [],
}) {
  const id = `prod_${_seq}`
  _seq += 1
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  return {
    id,
    name,
    slug,
    category,
    price,
    promoPrice,
    description,
    shortDescription: description.slice(0, 90) + (description.length > 90 ? '…' : ''),
    colors,
    sizes,
    stock,
    status: 'published',
    featured,
    bestseller,
    isNew,
    tags,
    images,
    seoTitle: `${name} | Ateliê Angel Art Crochê`,
    seoDescription: description.slice(0, 150),
    order: _seq,
    createdAt: new Date(Date.now() - _seq * 86400000).toISOString(),
  }
}

export const seedProducts = [
  prod({
    name: 'Porta xicara maça',
    category: 'decoracao',
    price: 20.0,
    description:
      'Porta-xícara em crochê de fio de malha no formato de maçã, com cabinho e folhinha. Peça artesanal perfeita para mesa posta ou presente.',
    colors: ['Vermelho'],
    sizes: ['Único'],
    featured: true,
    isNew: true,
    tags: ['mesa', 'crochê', 'fio de malha'],
    images: [local('produtos/porta-xicara-maca.png')],
  }),
  prod({
    name: 'ChaveiroDivino',
    category: 'presentes',
    price: 13.0,
    description:
      'Chaveiro em crochê de fio de malha com divino espírito santo e medalha personalizada. Ideal para lembrancinha de batizado.',
    colors: ['Areia', 'Verde'],
    sizes: ['Único'],
    bestseller: true,
    tags: ['batizado', 'lembrança', 'personalizado'],
    images: [local('produtos/chaveiro-divino.png')],
  }),
  prod({
    name: 'Porta joía tulipa',
    category: 'decoracao',
    price: 28.0,
    description:
      'Porta-joia em crochê de fio de malha com detalhes em formato de tulipas. Delicado e funcional para organizar acessórios.',
    colors: ['Rosa', 'Lilás'],
    sizes: ['Único'],
    featured: true,
    tags: ['organização', 'tulipa', 'presente'],
    images: [local('produtos/porta-joia-tulipa.png')],
  }),
  prod({
    name: 'Kit higiene bebê 5 peças',
    category: 'enxovais',
    price: 360.0,
    description:
      'Kit higiene completo com 5 peças em crochê de fio de malha, com aplicações de bichinhos. Perfeito para o quartinho do bebê.',
    colors: ['Verde água', 'Bege', 'Branco'],
    sizes: ['Kit'],
    featured: true,
    bestseller: true,
    tags: ['bebê', 'kit', 'higiene'],
    images: [local('produtos/kit-higiene-bebe-5.png')],
  }),
  prod({
    name: 'Mini Porta Panetone',
    category: 'decoracao',
    price: 37.0,
    description:
      'Mini porta-panetone em crochê de fio de malha com tema natalino. Ideal para mesa de festa ou presente de fim de ano.',
    colors: ['Verde', 'Vermelho', 'Branco'],
    sizes: ['Único'],
    isNew: true,
    tags: ['natal', 'festa', 'panetone'],
    images: [local('produtos/mini-porta-panetone.png')],
  }),
  prod({
    name: 'tulipas para difusores',
    category: 'decoracao',
    price: 18.0,
    description:
      'Tulipa em crochê de fio de malha para difusor de ambientes. Disponível em várias cores para combinar com a sua decoração.',
    colors: ['Variadas'],
    sizes: ['Único'],
    tags: ['difusor', 'tulipa', 'aroma'],
    images: [local('produtos/tulipas-difusores.png')],
  }),
  prod({
    name: 'Kit higiene bebê 3 peças',
    category: 'enxovais',
    price: 200.0,
    description:
      'Kit higiene com 3 peças em crochê de fio de malha nas cores sage, bege e branco. Prático e charmoso para o bebê.',
    colors: ['Sage', 'Bege', 'Branco'],
    sizes: ['Kit'],
    featured: true,
    tags: ['bebê', 'kit', 'higiene'],
    images: [local('produtos/kit-higiene-bebe-3.png')],
  }),
  prod({
    name: 'Guirlanda Decorativa',
    category: 'decoracao',
    price: 90.0,
    description:
      'Guirlanda decorativa em crochê de fio de malha com centro em MDF recortado em corações. Linda para porta ou parede.',
    colors: ['Rosa', 'Branco'],
    sizes: ['Único'],
    featured: true,
    tags: ['guirlanda', 'decoração', 'casa'],
    images: [local('produtos/guirlanda-decorativa.png')],
  }),
  prod({
    name: 'Sacola Presente M',
    category: 'presentes',
    price: 64.0,
    description:
      'Conjunto presente tamanho M com cesto florido em crochê e chaveiro de flor, acompanhado de tag especial. Pronto para presentear.',
    colors: ['Vermelho', 'Bege'],
    sizes: ['M'],
    bestseller: true,
    isNew: true,
    tags: ['presente', 'mãe', 'kit'],
    images: [local('produtos/sacola-presente-m.png')],
  }),
  prod({
    name: 'mandalaP',
    category: 'presentes',
    price: 19.0,
    description:
      'Mandala/chaveiro em crochê de fio de malha com divino espírito santo, medalha e cartão personalizado para batizado.',
    colors: ['Verde sage'],
    sizes: ['Único'],
    tags: ['batizado', 'lembrança', 'mandala'],
    images: [local('produtos/mandala-p.png')],
  }),
]

export const seedTestimonials = [
  {
    id: 't1',
    name: 'Marina Salles',
    role: 'Cliente • São Paulo, SP',
    text: 'O porta-xícara chegou ainda mais bonito do que nas fotos. Dá para sentir o capricho em cada ponto — já virou peça querida na minha mesa.',
    rating: 5,
    avatar: ph(200, 200, 'CCAFA1', '1F2937', 'MS'),
    featured: true,
  },
  {
    id: 't2',
    name: 'Camila Duarte',
    role: 'Cliente • Belo Horizonte, MG',
    text: 'Encomendei o kit higiene do bebê e recebi antes do prazo, com embalagem linda. Qualidade e cuidado do começo ao fim.',
    rating: 5,
    avatar: ph(200, 200, 'FDD7CA', '1F2937', 'CD'),
    featured: true,
  },
  {
    id: 't3',
    name: 'Fernanda Rocha',
    role: 'Cliente • Curitiba, PR',
    text: 'Atendimento acolhedor e peça impecável. A sacola presente é resistente, delicada e sempre rende elogios.',
    rating: 5,
    avatar: ph(200, 200, 'EAD9D0', '111827', 'FR'),
    featured: true,
  },
  {
    id: 't4',
    name: 'Juliana Prado',
    role: 'Cliente • Rio de Janeiro, RJ',
    text: 'O chaveiro Divino ficou um mimo. Perfeito para batizado — chegou no prazo e com acabamento caprichado.',
    rating: 5,
    avatar: ph(200, 200, 'FFF7F3', '1F2937', 'JP'),
    featured: false,
  },
  {
    id: 't5',
    name: 'Beatriz Lima',
    role: 'Cliente • Porto Alegre, RS',
    text: 'Já é a terceira peça que compro no ateliê. O acabamento surpreende sempre e a comunicação é rápida e humana.',
    rating: 5,
    avatar: ph(200, 200, 'F5C4B4', '4B5563', 'BL'),
    featured: false,
  },
  {
    id: 't6',
    name: 'Helena Castro',
    role: 'Cliente • Florianópolis, SC',
    text: 'Pedimos a guirlanda personalizada e ficou exatamente como sonhamos. Feito à mão com carinho que se sente de longe.',
    rating: 5,
    avatar: ph(200, 200, 'CCAFA1', '1F2937', 'HC'),
    featured: true,
  },
]

export const seedFaqs = [
  {
    id: 'f1',
    question: 'Quanto tempo leva para produzir uma peça?',
    answer:
      'Peças prontas saem mais rápido. Encomendas e personalizações levam, em média, de 7 a 15 dias úteis — o prazo exato depende do modelo e da fila do ateliê. Se você tem uma data especial, avise: a gente combina juntos.',
  },
  {
    id: 'f2',
    question: 'Posso escolher cor, tamanho e detalhes?',
    answer:
      'Sim. Depois de escolher o modelo, alinhamos cor, tamanho e pequenos ajustes pelo WhatsApp. Cada peça é feita sob medida, com o tempo e o capricho que o crochê pede.',
  },
  {
    id: 'f3',
    question: 'Vocês enviam para todo o Brasil?',
    answer:
      'Sim. Enviamos para todo o país com embalagem reforçada e cuidados extras para a peça chegar linda e intacta.',
  },
  {
    id: 'f4',
    question: 'Como cuidar das peças de crochê?',
    answer:
      'Prefira lavagem delicada à mão, com sabão neutro, e seque à sombra na horizontal. Assim o formato e a textura se preservam por muito mais tempo.',
  },
  {
    id: 'f5',
    question: 'Posso pedir um orçamento sem compromisso?',
    answer:
      'Pode sim. Conte sua ideia no formulário ou no WhatsApp — retornamos com prazo, valores e opções, sem pressão.',
  },
  {
    id: 'f6',
    question: 'As peças têm garantia?',
    answer:
      'Toda peça passa por conferência de acabamento antes do envio. Se algo não estiver certo, fale conosco: resolvemos com o mesmo cuidado de quem fez à mão.',
  },
]

export const seedBanners = {
  hero: {
    eyebrow: 'Ateliê Angel Art Crochê',
    title: 'Crochê feito à mão para momentos que merecem carinho',
    subtitle:
      'Peças autorais e sob encomenda — decoração, enxovais, presentes e personalizados — tramadas fio a fio com acabamento caprichado.',
    primaryCta: 'Ver coleção',
    primaryCtaLink: '/loja',
    secondaryCta: 'Pedir orçamento',
    secondaryCtaLink: '#contato',
    image: local('banners/hero.png') + '?v=10',
  },
  carousel: [
    {
      id: 'carousel_1',
      title: 'Decoração que acolhe',
      subtitle: 'Porta-joias, mandalas e detalhes que deixam a casa com a sua cara.',
      image: local('banners/carousel-1.jpg'),
      ctaLabel: 'Ver decoração',
      ctaLink: '/loja?categoria=decoracao',
    },
    {
      id: 'carousel_2',
      title: 'Presentes com alma',
      subtitle: 'Lembranças delicadas para batizado, aniversário ou um “obrigada” especial.',
      image: local('banners/carousel-2.jpg'),
      ctaLabel: 'Ver presentes',
      ctaLink: '/loja?categoria=presentes',
    },
    {
      id: 'carousel_3',
      title: 'Enxoval com mimo',
      subtitle: 'Kits e peças para celebrar a chegada do bebê com delicadeza.',
      image: local('banners/carousel-3.jpg'),
      ctaLabel: 'Ver enxovais',
      ctaLink: '/loja?categoria=enxovais',
    },
    {
      id: 'carousel_4',
      title: 'Feito sob a sua medida',
      subtitle: 'Conte a ocasião e a cor dos seus sonhos — nós tramamos o restante.',
      image: local('banners/carousel-4.jpg'),
      ctaLabel: 'Quero personalizar',
      ctaLink: '#contato',
    },
  ],
  promo: {
    title: 'Uma peça só sua, para o seu momento',
    subtitle: 'Casamento, chá de bebê, batizado ou presente especial — criamos sob encomenda com o mesmo cuidado artesanal.',
    image: local('banners/promo.jpg'),
    ctaLabel: 'Falar com o ateliê',
    ctaLink: '#contato',
  },
}

export const seedSettings = {
  siteName: 'Angel Art',
  tagline: 'Ateliê de Crochê',
  aboutTitle: 'Um ateliê onde cada ponto tem intenção',
  aboutText:
    'No Angel Art, o crochê não é produção em série: é tempo, escolha de fio e mão dedicada. Criamos peças para vestir, decorar e presentear — sempre com acabamento caprichado e a liberdade de personalizar cor, tamanho e detalhes. Aqui, exclusividade não é slogan: é o jeito de fazer.',
  aboutImage: local('sobre-atelie.jpg'),
  aboutHighlights: [
    { label: 'Peças tramadas', value: '2.400+' },
    { label: 'Clientes felizes', value: '1.100+' },
    { label: 'Anos de ofício', value: '12' },
  ],
  email: 'contato@ateliêangelartcrochê.com.br',
  phone: '(34) 9337-0311',
  whatsapp: '553493370311',
  instagram: '@atelieangelartcroche',
  facebook: 'https://www.facebook.com/profile.php?id=61559814745846',
  address: 'Rua Salerno 81, Bairro Jardim Europa, Uberlândia MG — CEP 38414689',
  footerText:
    'Crochê artesanal feito à mão: peças únicas para casa, presentes e momentos especiais.',
  ctaTitle: 'Quer uma peça pensada especialmente para você?',
  ctaSubtitle:
    'Conte a ocasião, a cor e o estilo. Retornamos com prazo, valores e a melhor forma de tornar sua ideia real.',
  benefits: [
    { title: 'Feito à mão, de verdade', desc: 'Cada peça nasce no agulha, sem fábrica e sem atalho.' },
    { title: 'Personalização com carinho', desc: 'Cor, tamanho e detalhes alinhados com você antes de começar.' },
    { title: 'Envio bem embalado', desc: 'Sua peça viaja protegida, pronta para abrir com alegria.' },
    { title: 'Edições únicas', desc: 'Poucas unidades, muito capricho — nada de cópia em massa.' },
    { title: 'Acabamento caprichado', desc: 'Fios selecionados e revisão cuidadosa antes do envio.' },
    { title: 'Atendimento próximo', desc: 'Conversa humana do primeiro “olá” até a entrega.' },
  ],
}

export const seedOrders = [
  {
    id: 'ord_1',
    customerName: 'Patrícia Nogueira',
    contact: '(11) 97777-2233',
    email: 'patricia.n@email.com',
    items: 'Porta joía tulipa (Rosa)',
    total: 28.0,
    status: 'novo',
    type: 'pedido',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'ord_2',
    customerName: 'Renata Costa',
    contact: '(21) 96666-1122',
    email: 'renata.costa@email.com',
    items: 'Orçamento: Kit higiene bebê 5 peças personalizado',
    total: null,
    status: 'em_andamento',
    type: 'orcamento',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'ord_3',
    customerName: 'Ana Beatriz Souza',
    contact: '(31) 95555-9988',
    email: 'ana.beatriz@email.com',
    items: 'Kit higiene bebê 3 peças + ChaveiroDivino',
    total: 213.0,
    status: 'concluido',
    type: 'pedido',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'ord_4',
    customerName: 'Larissa Martins',
    contact: '(41) 94444-7766',
    email: 'larissa.m@email.com',
    items: 'Sacola Presente M',
    total: 64.0,
    status: 'cancelado',
    type: 'pedido',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
]

export const seedUsers = [
  {
    id: 'user_admin',
    name: 'Administradora do Ateliê',
    email: 'admin@linhaeponto.com',
    password: 'crochedelicado',
    role: 'admin',
    status: 'ativo',
    avatar: ph(200, 200, 'EAD9D0', '111827', 'AT'),
  },
  {
    id: 'user_editor',
    name: 'Equipe de Conteúdo',
    email: 'editor@linhaeponto.com',
    password: 'editor123',
    role: 'editor',
    status: 'ativo',
    avatar: ph(200, 200, 'FDD7CA', '1F2937', 'EC'),
  },
]
